namespace VmsBackend.Models.Responses;

public class ApprovalResponse
{
    public Guid ApprovalId { get; set; }
    public Guid VisitorId { get; set; }
    public string VisitorName { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string PurposeOfVisit { get; set; } = string.Empty;
    public Guid HostEmployeeId { get; set; }
    public string? HostName { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? DeniedAt { get; set; }
    public string? DenialReason { get; set; }
    public string? DenialNote { get; set; }
}
