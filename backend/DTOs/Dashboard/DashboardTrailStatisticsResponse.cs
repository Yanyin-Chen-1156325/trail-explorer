namespace backend.DTOs.Dashboard;

public record DashboardTrailStatisticsResponse(
    int CompletedTrails,
    int UniqueTrailsCompleted,
    int RegionsExplored);
