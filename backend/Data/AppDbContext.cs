using Microsoft.EntityFrameworkCore;

namespace VmsBackend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<OtpToken> OtpTokens => Set<OtpToken>();
    public DbSet<PasswordHistory> PasswordHistories => Set<PasswordHistory>();
    public DbSet<AuthAuditLog> AuthAuditLogs => Set<AuthAuditLog>();
    public DbSet<TokenDenylistEntry> TokenDenylist => Set<TokenDenylistEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Role)
                  .HasDefaultValue("Receptionist");
        });

        // Sessions
        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasIndex(s => s.UserId);
            entity.HasIndex(s => s.ExpiresAt);
            entity.HasOne(s => s.User)
                  .WithMany(u => u.Sessions)
                  .HasForeignKey(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // OTP Tokens
        modelBuilder.Entity<OtpToken>(entity =>
        {
            entity.HasIndex(o => o.UserId);
            entity.HasIndex(o => o.ExpiresAt);
            entity.HasOne(o => o.User)
                  .WithMany(u => u.OtpTokens)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Password History
        modelBuilder.Entity<PasswordHistory>(entity =>
        {
            entity.HasIndex(ph => ph.UserId);
            entity.HasOne(ph => ph.User)
                  .WithMany(u => u.PasswordHistories)
                  .HasForeignKey(ph => ph.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Auth Audit Log — INSERT only at application level; DB-level REVOKE applied via migration (AC-13)
        modelBuilder.Entity<AuthAuditLog>(entity =>
        {
            entity.HasIndex(a => a.Timestamp);
            entity.HasIndex(a => a.UserId);
            entity.HasIndex(a => a.EventType);
            // UserId is nullable (failed login before user lookup)
            entity.HasOne(a => a.User)
                  .WithMany(u => u.AuditLogs)
                  .HasForeignKey(a => a.UserId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Token Denylist
        modelBuilder.Entity<TokenDenylistEntry>(entity =>
        {
            entity.HasIndex(t => t.ExpiresAt);
        });
    }
}
