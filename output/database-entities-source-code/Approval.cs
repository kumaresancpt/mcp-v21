namespace VmsBackend.Data;

public class Approval
{
    public Guid Id { get; set; }
    public Guid VisitorId { get; set; }
    public Guid HostEmployeeId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Denied
    public DateTime? ApprovedAt { get; set; }
    public DateTime? DeniedAt { get; set; }
    public string? DenialReason { get; set; } // Unavailable, VisitNotScheduled, SecurityConcern, IncorrectHost, Other
    public string? DenialNote { get; set; } // Max 200 chars
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Visitor Visitor { get; set; } = null!;
    public virtual ICollection<ApprovalNotification> Notifications { get; set; } = new List<ApprovalNotification>();
}
