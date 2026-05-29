using VmsBackend.Models;

namespace VmsBackend.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent);
    Task LogoutAsync(string sessionToken, string ipAddress, string userAgent);
    Task<LoginResponse> ExtendSessionAsync(string sessionToken, string ipAddress, string userAgent);
    Task ForgotPasswordAsync(ForgotPasswordRequest request, string ipAddress, string userAgent);
    Task ResetPasswordAsync(ResetPasswordRequest request, string ipAddress, string userAgent);
    
    /// <summary>
    /// Register new user — AC-B1 through AC-B10
    /// </summary>
    /// <returns>Tuple of (Success, Response, ErrorDetail)</returns>
    Task<(bool Success, RegisterResponse Response, string ErrorDetail)> RegisterUserAsync(RegisterRequest request);
}
