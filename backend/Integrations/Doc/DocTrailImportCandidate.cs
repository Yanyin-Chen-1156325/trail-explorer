namespace backend.Integrations.Doc;

public class DocTrailImportCandidate
{
    public string DocId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Region { get; set; }

    public string? CityOrLocation { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public string? DistanceText { get; set; }

    public string? DifficultyText { get; set; }

    public string? StaticLink { get; set; }

    public double? X { get; set; }

    public double? Y { get; set; }
}
