namespace VmsBackend.Models.Requests;

public class VisitorRegistrationRequest
{
    public string FullName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string IdType { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public string PurposeOfVisit { get; set; } = string.Empty;
    public Guid HostEmployeeId { get; set; }
    public string? PhotoUrl { get; set; }
    public int? ExpectedDurationMinutes { get; set; }
    public string? CompanyName { get; set; }
    public string? Notes { get; set; }
}
