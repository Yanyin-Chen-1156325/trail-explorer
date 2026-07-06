using Microsoft.Extensions.Primitives;

namespace backend.Services;

public class TrailCacheInvalidator : ITrailCacheInvalidator, IDisposable
{
    private CancellationTokenSource _trailListTokenSource = new();
    private CancellationTokenSource _trailDetailsTokenSource = new();

    public IChangeToken TrailListToken =>
        new CancellationChangeToken(_trailListTokenSource.Token);

    public IChangeToken TrailDetailsToken =>
        new CancellationChangeToken(_trailDetailsTokenSource.Token);

    public void InvalidateTrailList()
    {
        ReplaceTokenSource(ref _trailListTokenSource);
    }

    public void InvalidateTrailDetails()
    {
        ReplaceTokenSource(ref _trailDetailsTokenSource);
    }

    public void Dispose()
    {
        _trailListTokenSource.Dispose();
        _trailDetailsTokenSource.Dispose();
    }

    private static void ReplaceTokenSource(ref CancellationTokenSource tokenSource)
    {
        var previousTokenSource = Interlocked.Exchange(
            ref tokenSource,
            new CancellationTokenSource());

        previousTokenSource.Cancel();
        previousTokenSource.Dispose();
    }
}
