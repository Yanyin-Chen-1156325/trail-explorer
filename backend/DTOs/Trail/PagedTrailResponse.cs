namespace backend.DTOs.Trail;

public class PagedTrailResponse
{
    public IReadOnlyList<TrailResponse> Items { get; set; } = [];

    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}
