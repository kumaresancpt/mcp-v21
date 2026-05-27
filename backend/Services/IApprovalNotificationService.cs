using VmsBackend.Data;

namespace VmsBackend.Services;

public interface IApprovalNotificationService
{
    Task SendApprovalNotification(Approval approval);
    Task SendDigitalPass(Visitor visitor, VisitorPass pass);
    Task SendReminder(Approval approval, int minutesSincePending);
    Task SendDenialNotification(Approval approval);
    Task RetryFailedNotifications();
    Task LogNotification(Guid approvalId, string channel, string status, string? errorMessage = null);
}
