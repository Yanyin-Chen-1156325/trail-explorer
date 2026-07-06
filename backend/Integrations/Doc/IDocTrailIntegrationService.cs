namespace backend.Integrations.Doc;

public interface IDocTrailIntegrationService
{
    Task<IReadOnlyList<DocTrailImportCandidate>> GetImportCandidatesAsync(
        CancellationToken cancellationToken = default);
}
