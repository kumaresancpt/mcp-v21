using VmsBackend.Data;

namespace VmsBackend.Services;

public interface IQrCodeService
{
    Task<VisitorPass> GenerateQrCode(Guid visitorId);
    string EncryptQrPayload(object payload);
    bool ValidateQrCode(string qrCode);
}
