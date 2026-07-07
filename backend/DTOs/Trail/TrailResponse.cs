using backend.Enums;

namespace backend.DTOs.Trail;

public class TrailResponse
{
    public Guid Id { get; set; }

    public string DocId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Region { get; set; } = string.Empty;

    public TrailDifficulty Difficulty { get; set; }

    public decimal DistanceKm { get; set; }

    public string Description { get; set; } = string.Empty;

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
