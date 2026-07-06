using backend.Services;
using Microsoft.Extensions.Options;

namespace backend.BackgroundServices;

public class TrailSynchronisationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly TrailSynchronisationOptions _options;
    private readonly ILogger<TrailSynchronisationBackgroundService> _logger;

    public TrailSynchronisationBackgroundService(
        IServiceScopeFactory serviceScopeFactory,
        IOptions<TrailSynchronisationOptions> options,
        ILogger<TrailSynchronisationBackgroundService> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("Trail synchronisation background service is disabled.");
            return;
        }

        _logger.LogInformation(
            "Trail synchronisation background service started. RunOnStartup: {RunOnStartup}, IntervalHours: {IntervalHours}.",
            _options.RunOnStartup,
            Math.Max(1, _options.IntervalHours));

        if (_options.RunOnStartup)
        {
            await RunSynchronisationAsync(stoppingToken);
        }

        var interval = TimeSpan.FromHours(Math.Max(1, _options.IntervalHours));
        _logger.LogInformation(
            "Trail synchronisation background service scheduled with interval {Interval}.",
            interval);
        using var timer = new PeriodicTimer(interval);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunSynchronisationAsync(stoppingToken);
        }
    }

    private async Task RunSynchronisationAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var trailSyncService = scope.ServiceProvider.GetRequiredService<ITrailSyncService>();

            var result = await trailSyncService.SyncFromDocAsync(cancellationToken);

            if (result.Succeeded)
            {
                _logger.LogInformation(
                    "Trail synchronisation completed. Candidates: {CandidatesFound}, Created: {Created}, Updated: {Updated}, Skipped: {Skipped}.",
                    result.CandidatesFound,
                    result.Created,
                    result.Updated,
                    result.Skipped);
                return;
            }

            _logger.LogWarning(
                "Trail synchronisation completed with failure. Error: {ErrorMessage}",
                result.ErrorMessage);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogInformation("Trail synchronisation background service is stopping.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Trail synchronisation background service failed.");
        }
    }
}
