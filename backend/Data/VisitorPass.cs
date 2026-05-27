namespace VmsBackend.Data;

public class VisitorPass
{
    public Guid Id { get; set; }
    public Guid VisitorId { get; set; }
    public string QrCode { get; set; } = string.Empty; // Encrypted blob with unique payload
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public DateTime? UsedAt { get; set; } // Null until gate check-in, then set
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Visitor Visitor { get; set; } = null!;
}
