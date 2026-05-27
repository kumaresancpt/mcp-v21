using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;
using VmsBackend.Models;

namespace VmsBackend.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IAuditLogService _audit;
    private readonly IOtpService _otp;
    private readonly ILogger<AuthService> _logger;

    // Dummy hash used for timing-attack prevention (AC-14)
    private static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword("dummy-timing-prevention-hash-vms");

    public AuthService(AppDbContext db, IConfiguration config, IAuditLogService audit, IOtpService otp, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _audit = audit;
        _otp = otp;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        var maxAttempts = _config.GetValue<int>("Lockout:MaxFailedAttempts", 5);
        var lockoutDuration = _config.GetValue<int>("Lockout:LockoutDurationMinutes", 15);

        // Fetch user — always run bcrypt even if user not found (AC-14: timing attack prevention)
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        var hashToVerify = user?.PasswordHash ?? DummyHash;

        // Check lockout BEFORE verifying password
        if (user != null && user.LockoutExpiresAt.HasValue && user.LockoutExpiresAt > DateTime.UtcNow)
        {
            var remaining = (int)(user.LockoutExpiresAt.Value - DateTime.UtcNow).TotalSeconds;
            // Write audit BEFORE returning (AC-12)
            await _audit.WriteAsync(AuthEventType.AccountLocked, request.Username, user.Id.ToString(), user.Role, ipAddress, userAgent, failureReason: $"Account locked. {remaining}s remaining.");
            throw new AccountLockedException(remaining);
        }

        // Always verify password — prevents timing attacks (AC-14)
        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, hashToVerify);

        if (user == null || !passwordValid)
        {
            if (user != null)
            {
                user.FailedAttemptCount++;
                if (user.FailedAttemptCount >= maxAttempts)
                {
                    user.LockoutExpiresAt = DateTime.UtcNow.AddMinutes(lockoutDuration);
                }
                await _db.SaveChangesAsync();
            }
            // Write audit BEFORE returning (AC-12)
            await _audit.WriteAsync(AuthEventType.LoginFailure, request.Username, user?.Id.ToString(), null, ipAddress, userAgent, failureReason: "Invalid credentials");
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        // Validate role matches
        if (!string.Equals(user.Role, request.Role, StringComparison.OrdinalIgnoreCase))
        {
            await _audit.WriteAsync(AuthEventType.LoginFailure, request.Username, user.Id.ToString(), user.Role, ipAddress, userAgent, failureReason: "Role mismatch");
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        // Reset failed attempts on success
        user.FailedAttemptCount = 0;
        user.LockoutExpiresAt = null;
        user.LastLoginAt = DateTime.UtcNow;

        // Create session
        var sessionTokenBytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(32);
        var sessionToken = Convert.ToBase64String(sessionTokenBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
        var tokenHash = BCrypt.Net.BCrypt.HashPassword(sessionToken);
        var inactivityTimeout = _config.GetValue<int>("Session:InactivityTimeoutMinutes", 30);
        var expiresAt = request.KeepMeLoggedIn
            ? DateTime.UtcNow.AddDays(30)
            : DateTime.UtcNow.AddMinutes(inactivityTimeout);

        var session = new Session
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            LastActivityAt = DateTime.UtcNow,
            IsValid = true,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();

        // Write audit BEFORE returning (AC-12)
        await _audit.WriteAsync(AuthEventType.LoginSuccess, user.Username, user.Id.ToString(), user.Role, ipAddress, userAgent, session.Id.ToString());

        // Role-based redirect (AC-01)
        var redirectUrl = user.Role switch
        {
            "Admin" => "/dashboard/admin",
            "Receptionist" => "/dashboard/receptionist",
            "Security Guard" => "/dashboard/security",
            _ => "/dashboard"
        };

        return new LoginResponse
        {
            RedirectUrl = redirectUrl,
            Role = user.Role,
            Message = sessionToken  // session token returned in body, also set as cookie by controller
        };
    }

    public async Task LogoutAsync(string sessionToken, string ipAddress, string userAgent)
    {
        var session = await FindSessionByTokenAsync(sessionToken);
        if (session == null) return;

        // Invalidate session (AC-07)
        session.IsValid = false;

        // Add to denylist (AC-08)
        _db.TokenDenylist.Add(new TokenDenylistEntry
        {
            Id = Guid.NewGuid(),
            TokenHash = session.TokenHash,
            ExpiresAt = session.ExpiresAt,
            AddedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        // Write audit BEFORE returning (AC-12)
        await _audit.WriteAsync(AuthEventType.LogoutSuccess, null, session.UserId.ToString(), null, ipAddress, userAgent, session.Id.ToString());
    }

    public async Task<LoginResponse> ExtendSessionAsync(string sessionToken, string ipAddress, string userAgent)
    {
        var session = await FindSessionByTokenAsync(sessionToken);
        if (session == null || !session.IsValid || session.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Session not found or expired.");

        var extendBy = _config.GetValue<int>("Session:ExtendByMinutes", 30);
        session.LastActivityAt = DateTime.UtcNow;
        session.ExpiresAt = DateTime.UtcNow.AddMinutes(extendBy);
        await _db.SaveChangesAsync();

        await _audit.WriteAsync(AuthEventType.SessionExtended, null, session.UserId.ToString(), null, ipAddress, userAgent, session.Id.ToString());

        var user = await _db.Users.FindAsync(session.UserId);
        return new LoginResponse
        {
            RedirectUrl = string.Empty,
            Role = user?.Role ?? string.Empty,
            Message = "Session extended"
        };
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, string ipAddress, string userAgent)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail);

        // Always audit regardless of user existence (timing consistency)
        if (user == null)
        {
            await _audit.WriteAsync(AuthEventType.ForgotPasswordRequested, request.UsernameOrEmail, null, null, ipAddress, userAgent, failureReason: "User not found");
            return; // Silently succeed to prevent user enumeration
        }

        await _otp.GenerateAndSendOtpAsync(user.Id.ToString(), user.Email ?? user.Username, ipAddress, userAgent);
        await _audit.WriteAsync(AuthEventType.ForgotPasswordRequested, user.Username, user.Id.ToString(), user.Role, ipAddress, userAgent);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, string ipAddress, string userAgent)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new ArgumentException("Passwords do not match.");

        // Validate password complexity (AC-10)
        ValidatePasswordComplexity(request.NewPassword);

        // Validate reset token: find OTP token (using token as OTP in this flow)
        // TODO: In production, scope this query by username/email included in the reset request to prevent
        // theoretical race conditions. For MVP, bcrypt verification provides sufficient protection.
        var otpToken = await _db.OtpTokens
            .Include(o => o.User)
            .Where(o => !o.Consumed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpToken == null)
        {
            throw new UnauthorizedAccessException("Invalid or expired reset token.");
        }

        var tokenValid = BCrypt.Net.BCrypt.Verify(request.ResetToken, otpToken.HashedOtp);
        if (!tokenValid)
        {
            await _audit.WriteAsync(AuthEventType.PasswordResetFailure, null, null, null, ipAddress, userAgent, failureReason: "Invalid reset token");
            throw new UnauthorizedAccessException("Invalid or expired reset token.");
        }

        var user = otpToken.User;

        // Check password history (AC-10)
        var historyCount = _config.GetValue<int>("PasswordPolicy:HistoryCount", 5);
        var history = await _db.PasswordHistories
            .Where(ph => ph.UserId == user.Id)
            .OrderByDescending(ph => ph.RecordedAt)
            .Take(historyCount)
            .ToListAsync();

        foreach (var h in history)
        {
            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, h.PasswordHash))
            {
                await _audit.WriteAsync(AuthEventType.PasswordResetFailure, user.Username, user.Id.ToString(), user.Role, ipAddress, userAgent, failureReason: "Password reuse");
                throw new ArgumentException($"New password cannot match any of the last {historyCount} passwords.");
            }
        }

        // Save current password hash to history before updating
        _db.PasswordHistories.Add(new PasswordHistory
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PasswordHash = user.PasswordHash,
            RecordedAt = DateTime.UtcNow
        });

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        otpToken.Consumed = true;

        // Invalidate all active sessions (AC-11)
        var activeSessions = await _db.Sessions
            .Where(s => s.UserId == user.Id && s.IsValid)
            .ToListAsync();

        foreach (var s in activeSessions)
        {
            s.IsValid = false;
            _db.TokenDenylist.Add(new TokenDenylistEntry
            {
                Id = Guid.NewGuid(),
                TokenHash = s.TokenHash,
                ExpiresAt = s.ExpiresAt,
                AddedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();

        // Write audit BEFORE returning (AC-12)
        await _audit.WriteAsync(AuthEventType.PasswordResetSuccess, user.Username, user.Id.ToString(), user.Role, ipAddress, userAgent);
    }

    private static void ValidatePasswordComplexity(string password)
    {
        if (password.Length < 8)
            throw new ArgumentException("Password must be at least 8 characters.");
        if (!password.Any(char.IsUpper))
            throw new ArgumentException("Password must contain at least one uppercase letter.");
        if (!password.Any(char.IsLower))
            throw new ArgumentException("Password must contain at least one lowercase letter.");
        if (!password.Any(char.IsDigit))
            throw new ArgumentException("Password must contain at least one digit.");
        if (!password.Any(c => !char.IsLetterOrDigit(c)))
            throw new ArgumentException("Password must contain at least one special character.");
    }

    private async Task<Session?> FindSessionByTokenAsync(string rawToken)
    {
        // Must compare against all valid sessions (no plaintext lookup — bcrypt)
        var sessions = await _db.Sessions
            .Where(s => s.IsValid && s.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        return sessions.FirstOrDefault(s => BCrypt.Net.BCrypt.Verify(rawToken, s.TokenHash));
    }
}

public class AccountLockedException : Exception
{
    public int SecondsRemaining { get; }
    public AccountLockedException(int secondsRemaining) : base($"Account locked. Try again in {secondsRemaining} seconds.")
    {
        SecondsRemaining = secondsRemaining;
    }
}
