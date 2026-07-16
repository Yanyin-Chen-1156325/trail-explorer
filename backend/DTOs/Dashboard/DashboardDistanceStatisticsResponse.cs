namespace backend.DTOs.Dashboard;

public record DashboardDistanceStatisticsResponse(
    decimal TotalDistanceKm,
    decimal AverageDistanceKm,
    decimal LongestTrailDistanceKm);
