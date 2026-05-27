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
    public DbSet<Visitor> Visitors => Set<Visitor>();
    public DbSet<Approval> Approvals => Set<Approval>();
    public DbSet<VisitorPass> VisitorPasses => Set<VisitorPass>();
    public DbSet<ApprovalNotification> ApprovalNotifications => Set<ApprovalNotification>();
    public DbSet<Employee> Employees => Set<Employee>();

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

        // Visitors (AC-DB-01)
        modelBuilder.Entity<Visitor>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.FullName).IsRequired();
            entity.Property(v => v.MobileNumber).IsRequired();
            entity.Property(v => v.CompanyName).IsRequired();
            entity.Property(v => v.IdType).IsRequired();
            entity.Property(v => v.IdNumber).IsRequired();
            entity.Property(v => v.PurposeOfVisit).IsRequired();
            entity.Property(v => v.Status).IsRequired().HasDefaultValue("Pending");
            entity.Property(v => v.CreatedAt).IsRequired();
            entity.Property(v => v.UpdatedAt).IsRequired();
            entity.Property(v => v.CreatedBy).IsRequired();

            // Indexes per AC-DB-01
            entity.HasIndex(v => v.FullName);
            entity.HasIndex(v => new { v.MobileNumber, v.CreatedAt });
            entity.HasIndex(v => new { v.IdType, v.IdNumberLast4, v.CreatedAt });
            entity.HasIndex(v => new { v.Status, v.CreatedAt });
        });

        // Approvals
        modelBuilder.Entity<Approval>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Status).IsRequired().HasDefaultValue("Pending");
            entity.Property(a => a.CreatedAt).IsRequired();
            entity.Property(a => a.UpdatedAt).IsRequired();

            entity.HasOne(a => a.Visitor)
                  .WithMany(v => v.Approvals)
                  .HasForeignKey(a => a.VisitorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(a => new { a.Status, a.CreatedAt });
            entity.HasIndex(a => a.HostEmployeeId);
        });

        // Visitor Passes
        modelBuilder.Entity<VisitorPass>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.QrCode).IsRequired();
            entity.Property(p => p.ValidFrom).IsRequired();
            entity.Property(p => p.ValidTo).IsRequired();
            entity.Property(p => p.CreatedAt).IsRequired();

            entity.HasOne(p => p.Visitor)
                  .WithMany(v => v.Passes)
                  .HasForeignKey(p => p.VisitorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(p => new { p.VisitorId, p.ValidFrom });
            entity.HasIndex(p => p.ValidTo);
        });

        // Approval Notifications
        modelBuilder.Entity<ApprovalNotification>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Channel).IsRequired();
            entity.Property(n => n.Status).IsRequired().HasDefaultValue("Pending");
            entity.Property(n => n.RetryCount).IsRequired().HasDefaultValue(0);
            entity.Property(n => n.CreatedAt).IsRequired();

            entity.HasOne(n => n.Approval)
                  .WithMany(a => a.Notifications)
                  .HasForeignKey(n => n.ApprovalId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(n => new { n.Status, n.CreatedAt });
            entity.HasIndex(n => n.ApprovalId);
        });

        // Employees
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EmployeeId).IsRequired();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Department).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasIndex(e => e.EmployeeId).IsUnique();
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.Department);
        });
    }
}
