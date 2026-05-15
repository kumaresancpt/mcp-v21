using VmsBackend.Models;

namespace VmsBackend.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent);
    Task LogoutAsync(string sessionToken, string ipAddress, string userAgent);
    Task<LoginResponse> ExtendSessionAsync(string sessionToken, string ipAddress, string userAgent);
    Task ForgotPasswordAsync(ForgotPasswordRequest request, string ipAddress, string userAgent);
    Task ResetPasswordAsync(ResetPasswordRequest request, string ipAddress, string userAgent);
}
