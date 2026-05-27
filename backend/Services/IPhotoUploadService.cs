namespace VmsBackend.Services;

public interface IPhotoUploadService
{
    Task<string> UploadPhoto(IFormFile file);
    Task ValidatePhotoFile(IFormFile file);
    string GenerateSignedUrl(string photoPath, int validForDays = 7);
}
