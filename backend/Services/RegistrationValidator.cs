using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;
using VmsBackend.Models;

namespace VmsBackend.Services;

/// <summary>
/// Registration validation service — handles validation for user registration
/// Covers AC-B2, AC-B3, AC-B4, AC-B5, AC-B10
/// </summary>
public class RegistrationValidator
{
    private readonly AppDbContext _db;

    public RegistrationValidator(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Validate email format and uniqueness against database — AC-B2
    /// </summary>
    /// <returns>Error message if invalid, null if valid</returns>
    public async Task<string?> ValidateEmailAsync(string email)
    {
        // Check format
        if (string.IsNullOrWhiteSpace(email))
            return "Email is required";

        // Basic email format validation
        var emailRegex = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
        if (!Regex.IsMatch(email, emailRegex))
            return "Email must be in a valid format";

        // Check uniqueness — AC-B2: return 400 if duplicate
        var existingUser = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);

        if (existingUser != null)
            return "Email is already registered";

        return null;
    }

    /// <summary>
    /// Validate password and confirmPassword — AC-B3, AC-B4
    /// </summary>
    /// <returns>Error message if invalid, null if valid</returns>
    public string? ValidatePassword(string password, string confirmPassword)
    {
        // Check required
        if (string.IsNullOrWhiteSpace(password))
            return "Password is required";

        if (string.IsNullOrWhiteSpace(confirmPassword))
            return "Confirm password is required";

        // Check minimum length — AC-B4: minimum 8 characters
        if (password.Length < 8)
            return "Password must be at least 8 characters";

        // Check match — AC-B3: password and confirmPassword must match
        if (password != confirmPassword)
            return "Password and confirm password do not match";

        return null;
    }

    /// <summary>
    /// Validate phone number — AC-B5
    /// Basic validation: 10+ digits
    /// </summary>
    /// <returns>Error message if invalid, null if valid</returns>
    public string? ValidatePhoneNumber(string phoneNumber)
    {
        // Check required
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return "Phone number is required";

        // Remove common formatting characters
        var digitsOnly = Regex.Replace(phoneNumber, @"[^\d]", "");

        // Check minimum 10 digits — AC-B5: valid format
        if (digitsOnly.Length < 10)
            return "Phone number must contain at least 10 digits";

        return null;
    }

    /// <summary>
    /// Comprehensive request validation — AC-B2, AC-B3, AC-B4, AC-B5, AC-B10
    /// </summary>
    /// <returns>Error message if invalid, null if valid</returns>
    public async Task<string?> ValidateRequestAsync(RegisterRequest request)
    {
        // Check required fields — AC-B10
        if (string.IsNullOrWhiteSpace(request.Name))
            return "Name is required";

        if (string.IsNullOrWhiteSpace(request.Email))
            return "Email is required";

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            return "Phone number is required";

        if (string.IsNullOrWhiteSpace(request.Password))
            return "Password is required";

        if (string.IsNullOrWhiteSpace(request.ConfirmPassword))
            return "Confirm password is required";

        // Validate email — AC-B2
        var emailError = await ValidateEmailAsync(request.Email);
        if (!string.IsNullOrEmpty(emailError))
            return emailError;

        // Validate password — AC-B3, AC-B4
        var passwordError = ValidatePassword(request.Password, request.ConfirmPassword);
        if (!string.IsNullOrEmpty(passwordError))
            return passwordError;

        // Validate phone number — AC-B5
        var phoneError = ValidatePhoneNumber(request.PhoneNumber);
        if (!string.IsNullOrEmpty(phoneError))
            return phoneError;

        return null;
    }
}
