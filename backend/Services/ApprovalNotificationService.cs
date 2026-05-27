using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;

namespace VmsBackend.Services;

public class ApprovalNotificationService : IApprovalNotificationService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ApprovalNotificationService> _logger;

    public ApprovalNotificationService(AppDbContext dbContext, IConfiguration configuration, ILogger<ApprovalNotificationService> logger)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendApprovalNotification(Approval approval)
    {
        var visitor = await _dbContext.Visitors.FirstOrDefaultAsync(v => v.Id == approval.VisitorId);
        if (visitor == null)
            return;

        var channels = new[] { "WhatsApp", "SMS", "Email" };
        var tasks = new List<Task>();

        foreach (var channel in channels)
        {
            tasks.Add(SendNotificationOnChannel(approval, visitor, channel, "approval"));
        }

        await Task.WhenAll(tasks);
    }

    public async Task SendDigitalPass(Visitor visitor, VisitorPass pass)
    {
        // Send QR code via SMS/WhatsApp/Email within 2 minutes
        var channels = new[] { "SMS", "WhatsApp" };

        foreach (var channel in channels)
        {
            var notification = new ApprovalNotification
            {
                Id = Guid.NewGuid(),
                ApprovalId = pass.VisitorId, // In production, map to approval ID
                Channel = channel,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.ApprovalNotifications.Add(notification);

            // Simulate sending (in production, call actual SMS/WhatsApp API)
            _logger.LogInformation($"Sending digital pass via {channel} to visitor {visitor.FullName}");
        }

        await _dbContext.SaveChangesAsync();
    }

    public async Task SendReminder(Approval approval, int minutesSincePending)
    {
        var visitor = await _dbContext.Visitors.FirstOrDefaultAsync(v => v.Id == approval.VisitorId);
        if (visitor == null)
            return;

        if (minutesSincePending == 15)
        {
            // Send reminder to host at 15 minutes
            await SendNotificationOnChannel(approval, visitor, "Email", "reminder_15min");
        }
        else if (minutesSincePending == 30)
        {
            // Alert receptionist at 30 minutes
            await SendNotificationOnChannel(approval, visitor, "Email", "alert_receptionist_30min");
        }
    }

    public async Task SendDenialNotification(Approval approval)
    {
        var visitor = await _dbContext.Visitors.FirstOrDefaultAsync(v => v.Id == approval.VisitorId);
        if (visitor == null)
            return;

        // Notify receptionist and visitor
        var channels = new[] { "Email", "SMS" };

        foreach (var channel in channels)
        {
            await SendNotificationOnChannel(approval, visitor, channel, "denial");
        }
    }

    public async Task RetryFailedNotifications()
    {
        var failedNotifications = await _dbContext.ApprovalNotifications
            .Where(n => n.Status == "Failed" && n.RetryCount < 3)
            .OrderBy(n => n.LastRetryAt)
            .Take(10)
            .ToListAsync();

        foreach (var notification in failedNotifications)
        {
            notification.RetryCount++;
            notification.LastRetryAt = DateTime.UtcNow;
            notification.Status = "Pending"; // Re-attempt
        }

        await _dbContext.SaveChangesAsync();
    }

    public async Task LogNotification(Guid approvalId, string channel, string status, string? errorMessage = null)
    {
        var notification = new ApprovalNotification
        {
            Id = Guid.NewGuid(),
            ApprovalId = approvalId,
            Channel = channel,
            Status = status,
            ErrorMessage = errorMessage,
            SentAt = status == "Sent" ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ApprovalNotifications.Add(notification);
        await _dbContext.SaveChangesAsync();
    }

    private async Task SendNotificationOnChannel(Approval approval, Visitor visitor, string channel, string notificationType)
    {
        try
        {
            // Placeholder for actual notification service calls
            _logger.LogInformation($"Sending {notificationType} notification via {channel} for approval {approval.Id}");

            // In production, integrate with:
            // - Twilio for SMS
            // - WhatsApp API
            // - SendGrid/AWS SES for Email

            await LogNotification(approval.Id, channel, "Sent");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to send {notificationType} via {channel}: {ex.Message}");
            await LogNotification(approval.Id, channel, "Failed", ex.Message);
        }
    }
}
