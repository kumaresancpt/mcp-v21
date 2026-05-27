namespace VmsBackend.Services;

public class PhotoUploadService : IPhotoUploadService
{
    private readonly IConfiguration _configuration;
    private readonly string _uploadDir;
    private readonly long _maxFileSize = 2 * 1024 * 1024; // 2 MB

    public PhotoUploadService(IConfiguration configuration, IWebHostEnvironment env)
    {
        _configuration = configuration;
        _uploadDir = Path.Combine(env.ContentRootPath, "uploads", "photos");
        Directory.CreateDirectory(_uploadDir);
    }

    public async Task ValidatePhotoFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new InvalidOperationException("File is required");

        if (file.Length > _maxFileSize)
            throw new InvalidOperationException("File size exceeds 2 MB limit");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(fileExtension))
            throw new InvalidOperationException("Only .jpg, .jpeg, and .png files are allowed");

        // Check MIME type
        var allowedMimeTypes = new[] { "image/jpeg", "image/png" };
        if (!allowedMimeTypes.Contains(file.ContentType))
            throw new InvalidOperationException("Invalid file type");
    }

    public async Task<string> UploadPhoto(IFormFile file)
    {
        await ValidatePhotoFile(file);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(_uploadDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Generate signed URL (valid for 7 days)
        return GenerateSignedUrl(fileName, 7);
    }

    public string GenerateSignedUrl(string photoPath, int validForDays = 7)
    {
        // In production, this would generate a signed URL from S3/Azure Blob
        // For now, return a simple local URL with expiry info
        var baseUrl = _configuration["AppSettings:PhotoBaseUrl"] ?? "http://localhost:8000/api/photos";
        var expiryTime = DateTime.UtcNow.AddDays(validForDays).Ticks;
        return $"{baseUrl}/{photoPath}?expires={expiryTime}";
    }
}
