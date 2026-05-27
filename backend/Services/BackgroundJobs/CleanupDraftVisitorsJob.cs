using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;

namespace VmsBackend.Services.BackgroundJobs;

public class CleanupDraftVisitorsJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CleanupDraftVisitorsJob> _logger;
    private readonly int _draftExpiryHours;

    public CleanupDraftVisitorsJob(IServiceProvider serviceProvider, ILogger<CleanupDraftVisitorsJob> logger, IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _draftExpiryHours = configuration.GetValue<int>("NotificationSettings:DraftExpiryHours", 4);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Run every hour
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);

                using (var scope = _serviceProvider.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    var cutoffTime = DateTime.UtcNow.AddHours(-_draftExpiryHours);
                    var draftsToDelete = await dbContext.Visitors
                        .Where(v => v.Status == "Draft" && v.CreatedAt < cutoffTime)
                        .ToListAsync(stoppingToken);

                    if (draftsToDelete.Any())
                    {
                        dbContext.Visitors.RemoveRange(draftsToDelete);
                        await dbContext.SaveChangesAsync(stoppingToken);

                        _logger.LogInformation($"Cleaned up {draftsToDelete.Count} draft visitors");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CleanupDraftVisitorsJob");
            }
        }
    }
}
