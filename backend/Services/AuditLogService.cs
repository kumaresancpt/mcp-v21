using System.Text.Json;
using VmsBackend.Data;

namespace VmsBackend.Services;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AuditLogService> _logger;

    public AuditLogService(AppDbContext db, ILogger<AuditLogService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task WriteAsync(
        AuthEventType eventType,
        string? username,
        string? userId,
        string? role,
        string? ipAddress,
        string? userAgent,
        string? sessionId = null,
        string? failureReason = null,
        object? contextData = null)
    {
        var entry = new AuthAuditLog
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            EventType = eventType.ToString(),
            Username = username,
            UserId = userId != null ? Guid.Parse(userId) : null,
            Role = role,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            SessionId = sessionId,
            FailureReason = failureReason,
            ContextJson = contextData != null ? JsonSerializer.Serialize(contextData) : null
        };

        try
        {
            _db.AuthAuditLogs.Add(entry);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Fail-closed: audit failure aborts the operation (AC-12)
            _logger.LogError(ex, "CRITICAL: Failed to write audit log for event {EventType}. Aborting operation.", eventType);
            throw new InvalidOperationException("Audit log write failed. Operation aborted.", ex);
        }
    }
}
