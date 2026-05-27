using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;

namespace VmsBackend.Services;

public class QrCodeService : IQrCodeService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public QrCodeService(AppDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task<VisitorPass> GenerateQrCode(Guid visitorId)
    {
        var visitor = await _dbContext.Visitors.FirstOrDefaultAsync(v => v.Id == visitorId);
        if (visitor == null)
            throw new InvalidOperationException("Visitor not found");

        // Create a unique QR code payload
        var payload = new
        {
            visitorId = visitorId,
            timestamp = DateTime.UtcNow,
            nonce = Guid.NewGuid().ToString()
        };

        var encryptedQr = EncryptQrPayload(payload);

        var pass = new VisitorPass
        {
            Id = Guid.NewGuid(),
            VisitorId = visitorId,
            QrCode = encryptedQr,
            ValidFrom = DateTime.UtcNow,
            ValidTo = DateTime.UtcNow.AddHours(8), // Valid for 8 hours by default
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.VisitorPasses.Add(pass);
        await _dbContext.SaveChangesAsync();

        return pass;
    }

    public string EncryptQrPayload(object payload)
    {
        var json = JsonSerializer.Serialize(payload);
        var bytes = Encoding.UTF8.GetBytes(json);

        // Simple encryption: Base64 + HMAC signature
        var key = _configuration["JwtSettings:SecretKey"] ?? "default-secret-key";
        var keyBytes = Encoding.UTF8.GetBytes(key);

        using (var hmac = new HMACSHA256(keyBytes))
        {
            var signature = hmac.ComputeHash(bytes);
            var combined = new byte[bytes.Length + signature.Length];
            Array.Copy(bytes, 0, combined, 0, bytes.Length);
            Array.Copy(signature, 0, combined, bytes.Length, signature.Length);

            return Convert.ToBase64String(combined);
        }
    }

    public bool ValidateQrCode(string qrCode)
    {
        try
        {
            var combined = Convert.FromBase64String(qrCode);
            var key = _configuration["JwtSettings:SecretKey"] ?? "default-secret-key";
            var keyBytes = Encoding.UTF8.GetBytes(key);

            // Extract bytes and signature
            const int signatureLength = 32; // SHA256
            var payloadLength = combined.Length - signatureLength;

            if (payloadLength <= 0)
                return false;

            var bytes = new byte[payloadLength];
            Array.Copy(combined, 0, bytes, 0, payloadLength);

            var receivedSignature = new byte[signatureLength];
            Array.Copy(combined, payloadLength, receivedSignature, 0, signatureLength);

            using (var hmac = new HMACSHA256(keyBytes))
            {
                var computedSignature = hmac.ComputeHash(bytes);
                return receivedSignature.SequenceEqual(computedSignature);
            }
        }
        catch
        {
            return false;
        }
    }
}
