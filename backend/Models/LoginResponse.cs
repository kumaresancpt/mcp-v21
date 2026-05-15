namespace VmsBackend.Models;

public class LoginResponse
{
    public string RedirectUrl { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Message { get; set; } = "Login successful";
}
