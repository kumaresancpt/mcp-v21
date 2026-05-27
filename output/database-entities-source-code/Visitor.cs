namespace VmsBackend.Data;

public class Visitor
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty; // Encrypted
    public string CompanyName { get; set; } = string.Empty;
    public string IdType { get; set; } = string.Empty; // Aadhar, PAN, Passport, DrivingLicense, VoterId, EmployeeId, Other
    public string IdNumber { get; set; } = string.Empty; // Encrypted
    public string? IdNumberLast4 { get; set; } // Last 4 chars for masking (unencrypted)
    public string? PhotoUrl { get; set; } // Signed URL (expires after 7 days)
    public Guid HostEmployeeId { get; set; }
    public string PurposeOfVisit { get; set; } = string.Empty;
    public int? ExpectedDurationMinutes { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Denied, Draft, CheckedIn, CheckedOut
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; set; } // ReceptionistId
    public string? Notes { get; set; }

    // Navigation properties
    public virtual ICollection<Approval> Approvals { get; set; } = new List<Approval>();
    public virtual ICollection<VisitorPass> Passes { get; set; } = new List<VisitorPass>();
}
