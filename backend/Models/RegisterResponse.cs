namespace VmsBackend.Models;

/// <summary>
/// Register response model for AC-B8: Success response after registration
/// </summary>
public class RegisterResponse
{
    /// <summary>Success message — AC-B8</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Newly created user ID (optional) — AC-B8</summary>
    public string? UserId { get; set; }
}
