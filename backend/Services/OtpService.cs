using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;

namespace VmsBackend.Services;

public class OtpService : IOtpService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IAuditLogService _audit;
    private readonly ILogger<OtpService> _logger;

    public OtpService(AppDbContext db, IConfiguration config, IAuditLogService audit, ILogger<OtpService> logger)
    {
        _db = db;
        _config = config;
        _audit = audit;
        _logger = logger;
    }

    public async Task<bool> GenerateAndSendOtpAsync(string userId, string email, string ipAddress, string userAgent)
    {
        var otpLength = _config.GetValue<int>("Otp:LengthDigits", 6);
        var validMinutes = _config.GetValue<int>("Otp:ValidMinutes", 10);

        // Invalidate any existing OTPs for this user
        var existing = await _db.OtpTokens
            .Where(o => o.UserId == Guid.Parse(userId) && !o.Consumed && o.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();
        foreach (var old in existing) old.Consumed = true;

        // Generate OTP
        var rawOtp = GenerateNumericOtp(otpLength);
        var hashedOtp = BCrypt.Net.BCrypt.HashPassword(rawOtp);

        var token = new OtpToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(userId),
            HashedOtp = hashedOtp,
            ExpiresAt = DateTime.UtcNow.AddMinutes(validMinutes),
            AttemptCount = 0,
            Consumed = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.OtpTokens.Add(token);
        await _db.SaveChangesAsync();

        // Send email (with exponential backoff retry)
        var sent = await SendEmailWithRetryAsync(email, rawOtp);

        await _audit.WriteAsync(AuthEventType.OtpGenerated, null, userId, null, ipAddress, userAgent);

        return sent;
    }

    public async Task<bool> VerifyOtpAsync(string userId, string otp, string ipAddress, string userAgent)
    {
        var maxAttempts = _config.GetValue<int>("Otp:MaxAttempts", 3);

        var token = await _db.OtpTokens
            .Where(o => o.UserId == Guid.Parse(userId) && !o.Consumed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (token == null) return false;

        token.AttemptCount++;

        if (token.AttemptCount > maxAttempts)
        {
            token.Consumed = true;
            await _db.SaveChangesAsync();
            await _audit.WriteAsync(AuthEventType.OtpFailed, null, userId, null, ipAddress, userAgent, failureReason: "Max OTP attempts exceeded");
            return false;
        }

        var valid = BCrypt.Net.BCrypt.Verify(otp, token.HashedOtp);
        if (!valid)
        {
            await _db.SaveChangesAsync();
            await _audit.WriteAsync(AuthEventType.OtpFailed, null, userId, null, ipAddress, userAgent, failureReason: "Invalid OTP");
            return false;
        }

        token.Consumed = true;
        await _db.SaveChangesAsync();
        await _audit.WriteAsync(AuthEventType.OtpVerified, null, userId, null, ipAddress, userAgent);
        return true;
    }

    private static string GenerateNumericOtp(int length)
    {
        var random = new Random();
        return string.Concat(Enumerable.Range(0, length).Select(_ => random.Next(0, 10).ToString()));
    }

    private async Task<bool> SendEmailWithRetryAsync(string to, string otp)
    {
        var retryDelays = new[] { 1000, 2000, 4000 };
        foreach (var delay in retryDelays)
        {
            try
            {
                using var client = new SmtpClient(_config["Email:SmtpHost"])
                {
                    Port = _config.GetValue<int>("Email:SmtpPort", 587),
                    Credentials = new NetworkCredential(_config["Email:Username"], _config["Email:Password"]),
                    EnableSsl = _config.GetValue<bool>("Email:EnableSsl", true),
                };
                var message = new MailMessage(
                    from: _config["Email:SenderEmail"] ?? "noreply@vms.com",
                    to: to,
                    subject: "VMS Password Reset OTP",
                    body: $"Your OTP for password reset is: {otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone."
                );
                await client.SendMailAsync(message);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "OTP email send failed, retrying in {Delay}ms...", delay);
                await Task.Delay(delay);
            }
        }
        _logger.LogError("OTP email delivery failed after all retries for {Email}", to);
        return false;
    }
}
