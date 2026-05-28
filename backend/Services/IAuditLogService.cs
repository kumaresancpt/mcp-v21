namespace VmsBackend.Services;

public enum AuthEventType
{
    LoginSuccess,
    LoginFailure,
    AccountLocked,
    SessionExpired,
    SessionExtended,
    LogoutSuccess,
    ForgotPasswordRequested,
    OtpGenerated,
    OtpVerified,
    OtpFailed,
    PasswordResetSuccess,
    PasswordResetFailure,
    TokenReplayed,
    RegistrationSuccess,
    RegistrationFailure
}

public interface IAuditLogService
{
    Task WriteAsync(
        AuthEventType eventType,
        string? username,
        string? userId,
        string? role,
        string? ipAddress,
        string? userAgent,
        string? sessionId = null,
        string? failureReason = null,
        object? contextData = null
    );
}
