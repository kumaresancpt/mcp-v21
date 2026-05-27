using System.Security.Claims;
using System.Text;

namespace VmsBackend.Services;

public class DataEncryptionService : IDataEncryptionService
{
    private readonly IConfiguration _configuration;

    public DataEncryptionService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Encrypt(string plaintext)
    {
        // Use EF Core's built-in encryption via ValueConverter
        // This is a placeholder; actual encryption happens in ValueConverter in DbContext
        // For now, return a simple Base64 encoding (EF Core will handle encryption)
        var bytes = Encoding.UTF8.GetBytes(plaintext);
        return Convert.ToBase64String(bytes);
    }

    public string Decrypt(string ciphertext)
    {
        // This is a placeholder; EF Core handles decryption via ValueConverter
        try
        {
            var bytes = Convert.FromBase64String(ciphertext);
            return Encoding.UTF8.GetString(bytes);
        }
        catch
        {
            return string.Empty;
        }
    }

    public string MaskIdNumber(string idNumber)
    {
        if (string.IsNullOrEmpty(idNumber) || idNumber.Length < 4)
            return "XXXX XXXX XXXX";

        var last4 = idNumber.Substring(idNumber.Length - 4);
        return $"XXXX XXXX {last4}";
    }

    public bool IsAdminRole(ClaimsPrincipal user)
    {
        var roleClaim = user.FindFirst(ClaimTypes.Role);
        return roleClaim?.Value == "Admin";
    }
}
