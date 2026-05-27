using System.Security.Claims;

namespace VmsBackend.Services;

public interface IDataEncryptionService
{
    string Encrypt(string plaintext);
    string Decrypt(string ciphertext);
    string MaskIdNumber(string idNumber);
    bool IsAdminRole(ClaimsPrincipal user);
}
