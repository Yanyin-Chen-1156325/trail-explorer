using backend.Enums;

namespace backend.DTOs.Trail;

public class TrailQueryRequest
{
    public string? Search { get; set; }

    public TrailDifficulty? Difficulty { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 20;
}
