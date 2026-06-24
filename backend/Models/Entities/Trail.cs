namespace TrailExplorer.Models.Entities;

public class Trail
{
    public Guid Id { get; set; }

    public string DocId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Region { get; set; } = string.Empty;

    public TrailDifficulty Difficulty { get; set; }

    public decimal DistanceKm { get; set; }

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<CheckIn> CheckIns { get; set; } = [];
}
