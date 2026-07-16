namespace backend.DTOs.Dashboard;

public record DashboardCheckInResponse(
    Guid Id,
    Guid TrailId,
    string TrailName,
    string Region,
    decimal DistanceKm,
    DateTime CompletedDate);
