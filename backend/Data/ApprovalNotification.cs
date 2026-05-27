namespace VmsBackend.Data;

public class ApprovalNotification
{
    public Guid Id { get; set; }
    public Guid ApprovalId { get; set; }
    public string Channel { get; set; } = string.Empty; // WhatsApp, SMS, Email
    public string Status { get; set; } = "Pending"; // Pending, Sent, Failed
    public DateTime? SentAt { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; } = 0;
    public DateTime? LastRetryAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Approval Approval { get; set; } = null!;
}
