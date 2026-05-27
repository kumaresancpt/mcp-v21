namespace VmsBackend.Models;

public class ForgotPasswordRequest
{
    public string UsernameOrEmail { get; set; } = string.Empty;
}
