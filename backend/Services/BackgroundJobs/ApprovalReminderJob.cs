using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;
using VmsBackend.Services;

namespace VmsBackend.Services.BackgroundJobs;

public class ApprovalReminderJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ApprovalReminderJob> _logger;

    public ApprovalReminderJob(IServiceProvider serviceProvider, ILogger<ApprovalReminderJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Run every minute
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

                using (var scope = _serviceProvider.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<IApprovalNotificationService>();

                    // Check for approvals pending for 15 minutes
                    var cutoff15Min = DateTime.UtcNow.AddMinutes(-15);
                    var approvals15Min = await dbContext.Approvals
                        .Where(a => a.Status == "Pending" && a.CreatedAt <= cutoff15Min)
                        .Include(a => a.Visitor)
                        .ToListAsync(stoppingToken);

                    foreach (var approval in approvals15Min)
                    {
                        var minutesPending = (int)(DateTime.UtcNow - approval.CreatedAt).TotalMinutes;
                        await notificationService.SendReminder(approval, minutesPending);
                    }

                    // Check for approvals pending for 30 minutes (alert receptionist)
                    var cutoff30Min = DateTime.UtcNow.AddMinutes(-30);
                    var approvals30Min = await dbContext.Approvals
                        .Where(a => a.Status == "Pending" && a.CreatedAt <= cutoff30Min)
                        .Include(a => a.Visitor)
                        .ToListAsync(stoppingToken);

                    foreach (var approval in approvals30Min)
                    {
                        var minutesPending = (int)(DateTime.UtcNow - approval.CreatedAt).TotalMinutes;
                        await notificationService.SendReminder(approval, minutesPending);
                    }

                    _logger.LogInformation($"Processed {approvals15Min.Count} 15-min reminders and {approvals30Min.Count} 30-min alerts");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ApprovalReminderJob");
            }
        }
    }
}
