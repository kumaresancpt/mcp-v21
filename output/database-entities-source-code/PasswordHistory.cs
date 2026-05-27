using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VmsBackend.Data;

[Table("password_history")]
public class PasswordHistory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("recorded_at")]
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
