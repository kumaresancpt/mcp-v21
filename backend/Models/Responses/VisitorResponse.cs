namespace VmsBackend.Models.Responses;

public class VisitorResponse
{
    public Guid VisitorId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string IdType { get; set; } = string.Empty;
    public string IdNumberMasked { get; set; } = string.Empty; // XXXX XXXX <last4>
    public string? PhotoUrl { get; set; }
    public Guid HostEmployeeId { get; set; }
    public string? HostName { get; set; }
    public string PurposeOfVisit { get; set; } = string.Empty;
    public int? ExpectedDurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? Notes { get; set; }
}
