using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VmsBackend.Data;

[Table("otp_tokens")]
public class OtpToken
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("hashed_otp")]
    public string HashedOtp { get; set; } = string.Empty;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("attempt_count")]
    public int AttemptCount { get; set; } = 0;

    [Column("consumed")]
    public bool Consumed { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
