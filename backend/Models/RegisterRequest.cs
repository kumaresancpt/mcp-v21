using System.ComponentModel.DataAnnotations;

namespace VmsBackend.Models;

/// <summary>
/// Register request model for AC-B1: User registration endpoint
/// </summary>
public class RegisterRequest
{
    /// <summary>User's full name — AC-B1, AC-B10</summary>
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(200, ErrorMessage = "Name must not exceed 200 characters")]
    public string Name { get; set; } = string.Empty;

    /// <summary>User's email — AC-B1, AC-B2, AC-B10</summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Email must be a valid email format")]
    [MaxLength(255, ErrorMessage = "Email must not exceed 255 characters")]
    public string Email { get; set; } = string.Empty;

    /// <summary>User's phone number — AC-B1, AC-B5, AC-B10</summary>
    [Required(ErrorMessage = "Phone number is required")]
    [Phone(ErrorMessage = "Phone number must be in a valid format")]
    [MaxLength(20, ErrorMessage = "Phone number must not exceed 20 characters")]
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>User's password — AC-B1, AC-B3, AC-B4, AC-B10</summary>
    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [MaxLength(100, ErrorMessage = "Password must not exceed 100 characters")]
    public string Password { get; set; } = string.Empty;

    /// <summary>Password confirmation — AC-B1, AC-B3, AC-B10</summary>
    [Required(ErrorMessage = "Confirm password is required")]
    [MaxLength(100, ErrorMessage = "Confirm password must not exceed 100 characters")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
