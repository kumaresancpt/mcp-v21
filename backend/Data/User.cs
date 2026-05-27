using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VmsBackend.Data;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("username")]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Column("email")]
    [MaxLength(255)]
    public string? Email { get; set; }

    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("role")]
    [MaxLength(50)]
    public string Role { get; set; } = "Receptionist";

    [Column("failed_attempt_count")]
    public int FailedAttemptCount { get; set; } = 0;

    [Column("lockout_expires_at")]
    public DateTime? LockoutExpiresAt { get; set; }

    [Column("last_login_at")]
    public DateTime? LastLoginAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
    public ICollection<OtpToken> OtpTokens { get; set; } = new List<OtpToken>();
    public ICollection<PasswordHistory> PasswordHistories { get; set; } = new List<PasswordHistory>();
    public ICollection<AuthAuditLog> AuditLogs { get; set; } = new List<AuthAuditLog>();
}
