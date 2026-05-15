using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VmsBackend.Data;

[Table("auth_audit_log")]
public class AuthAuditLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Column("event_type")]
    [MaxLength(100)]
    public string EventType { get; set; } = string.Empty;

    [Column("user_id")]
    public Guid? UserId { get; set; }

    [Column("username")]
    [MaxLength(100)]
    public string? Username { get; set; }

    [Column("role")]
    [MaxLength(50)]
    public string? Role { get; set; }

    [Column("ip_address")]
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [Column("user_agent")]
    [MaxLength(512)]
    public string? UserAgent { get; set; }

    [Column("session_id")]
    [MaxLength(100)]
    public string? SessionId { get; set; }

    [Column("failure_reason")]
    [MaxLength(500)]
    public string? FailureReason { get; set; }

    [Column("context_json")]
    public string? ContextJson { get; set; }

    // Navigation (optional — audit log may have null UserId for failed attempts)
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
