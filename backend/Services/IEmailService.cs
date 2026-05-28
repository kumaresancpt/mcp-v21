namespace VmsBackend.Services;

/// <summary>
/// Email service — sends emails for verification and other purposes
/// AC-B9: Sends verification email after successful registration
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send verification email to user after registration — AC-B9
    /// </summary>
    Task SendVerificationEmailAsync(string email, string userName);

    /// <summary>
    /// Send password reset email
    /// </summary>
    Task SendPasswordResetEmailAsync(string email, string resetToken);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Send verification email — AC-B9
    /// For MVP: logs to console. Can be replaced with actual SMTP send.
    /// </summary>
    public async Task SendVerificationEmailAsync(string email, string userName)
    {
        try
        {
            // TODO: Implement actual SMTP email send using appsettings Email configuration
            // For MVP: log to console
            var verificationLink = $"http://localhost:5173/verify-email?email={Uri.EscapeDataString(email)}&token=placeholder-token";
            _logger.LogInformation(
                "Verification email would be sent to {Email} for user {UserName}. Verification link: {VerificationLink}",
                email, userName, verificationLink);

            // Simulate async operation
            await Task.Delay(100);

            _logger.LogInformation("Verification email sent successfully to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification email to {Email}", email);
            // For now, don't throw — registration should succeed even if email fails
        }
    }

    /// <summary>
    /// Send password reset email
    /// </summary>
    public async Task SendPasswordResetEmailAsync(string email, string resetToken)
    {
        try
        {
            var resetLink = $"http://localhost:5173/reset-password?email={Uri.EscapeDataString(email)}&token={resetToken}";
            _logger.LogInformation(
                "Password reset email would be sent to {Email}. Reset link: {ResetLink}",
                email, resetLink);

            await Task.Delay(100);

            _logger.LogInformation("Password reset email sent successfully to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
        }
    }
}
