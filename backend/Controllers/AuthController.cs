using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using VmsBackend.Models;
using VmsBackend.Services;

namespace VmsBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService auth, ILogger<AuthController> logger)
    {
        _auth = auth;
        _logger = logger;
    }

    private string GetIpAddress() => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    private string GetUserAgent() => Request.Headers["User-Agent"].ToString();

    /// <summary>Login — AC-01, AC-02, AC-03, AC-04, AC-14</summary>
    [HttpPost("login")]
    [EnableRateLimiting("LoginPolicy")]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(typeof(ErrorResponse), 401)]
    [ProducesResponseType(typeof(ErrorResponse), 423)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _auth.LoginAsync(request, GetIpAddress(), GetUserAgent());

            // Set HttpOnly cookie with the session token (AC-07)
            // result.Message contains the raw session token from AuthService
            Response.Cookies.Append("vms_session", result.Message, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = request.KeepMeLoggedIn
                    ? DateTimeOffset.UtcNow.AddDays(30)
                    : DateTimeOffset.UtcNow.AddMinutes(30)
            });

            // Return response without exposing raw token in body
            return Ok(new LoginResponse
            {
                RedirectUrl = result.RedirectUrl,
                Role = result.Role,
                Message = "Login successful"
            });
        }
        catch (AccountLockedException ex)
        {
            return StatusCode(423, new ErrorResponse { Detail = ex.Message, SecondsRemaining = ex.SecondsRemaining });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ErrorResponse { Detail = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error");
            return StatusCode(500, new ErrorResponse { Detail = "An internal error occurred." });
        }
    }

    /// <summary>Logout — AC-07, AC-08</summary>
    [HttpPost("logout")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Cookies["vms_session"] ??
                    Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

        if (!string.IsNullOrEmpty(token))
        {
            await _auth.LogoutAsync(token, GetIpAddress(), GetUserAgent());
        }

        // Clear cookie (AC-07)
        Response.Cookies.Append("vms_session", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UnixEpoch,
            MaxAge = TimeSpan.Zero
        });

        return Ok(new { message = "Logged out successfully." });
    }

    /// <summary>Extend Session — AC-06</summary>
    [HttpPost("extend-session")]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(typeof(ErrorResponse), 401)]
    public async Task<IActionResult> ExtendSession()
    {
        try
        {
            var token = Request.Cookies["vms_session"] ??
                        Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            if (string.IsNullOrEmpty(token))
                return Unauthorized(new ErrorResponse { Detail = "No session token provided." });

            var result = await _auth.ExtendSessionAsync(token, GetIpAddress(), GetUserAgent());
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ErrorResponse { Detail = ex.Message });
        }
    }

    /// <summary>Forgot Password — AC-09</summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            await _auth.ForgotPasswordAsync(request, GetIpAddress(), GetUserAgent());
            // Always return 200 to prevent user enumeration
            return Ok(new { message = "If the account exists, a reset OTP has been sent to the registered email." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ForgotPassword error");
            return Ok(new { message = "If the account exists, a reset OTP has been sent to the registered email." });
        }
    }

    /// <summary>Reset Password — AC-10, AC-11</summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ErrorResponse), 400)]
    [ProducesResponseType(typeof(ErrorResponse), 401)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            await _auth.ResetPasswordAsync(request, GetIpAddress(), GetUserAgent());
            return Ok(new { message = "Password reset successfully. Please log in with your new password." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse { Detail = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ErrorResponse { Detail = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ResetPassword error");
            return StatusCode(500, new ErrorResponse { Detail = "An internal error occurred." });
        }
    }
}
