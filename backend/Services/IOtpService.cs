namespace VmsBackend.Services;

public interface IOtpService
{
    Task<bool> GenerateAndSendOtpAsync(string userId, string email, string ipAddress, string userAgent);
    Task<bool> VerifyOtpAsync(string userId, string otp, string ipAddress, string userAgent);
}
