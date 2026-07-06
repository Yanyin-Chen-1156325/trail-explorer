using backend.BackgroundServices;
using backend.DTOs.Trail;
using backend.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace backend.Tests.Services;

public class TrailSynchronisationBackgroundServiceTests
{
    [Fact]
    public async Task StartAsync_DoesNotRunSyncWhenDisabled()
    {
        var trailSyncService = new FakeTrailSyncService();
        await using var serviceProvider = CreateServiceProvider(trailSyncService);
        var backgroundService = CreateBackgroundService(
            serviceProvider,
            new TrailSynchronisationOptions
            {
                Enabled = false,
                RunOnStartup = true,
                IntervalHours = 1
            });

        await backgroundService.StartAsync(CancellationToken.None);
        await Task.Delay(50);
        await backgroundService.StopAsync(CancellationToken.None);

        Assert.Equal(0, trailSyncService.CallCount);
    }

    [Fact]
    public async Task StartAsync_RunsSyncOnStartupWhenEnabled()
    {
        var trailSyncService = new FakeTrailSyncService();
        await using var serviceProvider = CreateServiceProvider(trailSyncService);
        var backgroundService = CreateBackgroundService(
            serviceProvider,
            new TrailSynchronisationOptions
            {
                Enabled = true,
                RunOnStartup = true,
                IntervalHours = 1
            });

        await backgroundService.StartAsync(CancellationToken.None);
        await trailSyncService.WaitForCallAsync();
        await backgroundService.StopAsync(CancellationToken.None);

        Assert.Equal(1, trailSyncService.CallCount);
    }

    [Fact]
    public async Task StartAsync_DoesNotThrowWhenStartupSyncReturnsFailure()
    {
        var trailSyncService = new FakeTrailSyncService(new TrailSyncResult
        {
            Succeeded = false,
            ErrorMessage = "Sync failed."
        });
        await using var serviceProvider = CreateServiceProvider(trailSyncService);
        var backgroundService = CreateBackgroundService(
            serviceProvider,
            new TrailSynchronisationOptions
            {
                Enabled = true,
                RunOnStartup = true,
                IntervalHours = 1
            });

        await backgroundService.StartAsync(CancellationToken.None);
        await trailSyncService.WaitForCallAsync();
        await backgroundService.StopAsync(CancellationToken.None);

        Assert.Equal(1, trailSyncService.CallCount);
    }

    private static TrailSynchronisationBackgroundService CreateBackgroundService(
        ServiceProvider serviceProvider,
        TrailSynchronisationOptions options)
    {
        return new TrailSynchronisationBackgroundService(
            serviceProvider.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(options),
            NullLogger<TrailSynchronisationBackgroundService>.Instance);
    }

    private static ServiceProvider CreateServiceProvider(FakeTrailSyncService trailSyncService)
    {
        var services = new ServiceCollection();

        services.AddSingleton(trailSyncService);
        services.AddScoped<ITrailSyncService>(provider =>
            provider.GetRequiredService<FakeTrailSyncService>());

        return services.BuildServiceProvider();
    }

    private sealed class FakeTrailSyncService : ITrailSyncService
    {
        private readonly TaskCompletionSource _syncCalled = new(
            TaskCreationOptions.RunContinuationsAsynchronously);
        private readonly TrailSyncResult _result;

        public int CallCount { get; private set; }

        public FakeTrailSyncService(TrailSyncResult? result = null)
        {
            _result = result ?? new TrailSyncResult
            {
                Succeeded = true,
                CandidatesFound = 1,
                Created = 1
            };
        }

        public Task<TrailSyncResult> SyncFromDocAsync(CancellationToken cancellationToken = default)
        {
            CallCount++;
            _syncCalled.TrySetResult();

            return Task.FromResult(_result);
        }

        public Task WaitForCallAsync()
        {
            return _syncCalled.Task.WaitAsync(TimeSpan.FromSeconds(3));
        }
    }
}
