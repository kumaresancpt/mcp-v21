using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VmsBackend.Data;

[Table("sessions")]
public class Session
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("token_hash")]
    public string TokenHash { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("last_activity_at")]
    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;

    [Column("is_valid")]
    public bool IsValid { get; set; } = true;

    [Column("ip_address")]
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [Column("user_agent")]
    [MaxLength(512)]
    public string? UserAgent { get; set; }

    // Navigation
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
