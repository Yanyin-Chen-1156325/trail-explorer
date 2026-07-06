using Microsoft.Extensions.Primitives;

namespace backend.Services;

public interface ITrailCacheInvalidator
{
    IChangeToken TrailListToken { get; }

    IChangeToken TrailDetailsToken { get; }

    void InvalidateTrailList();

    void InvalidateTrailDetails();
}
