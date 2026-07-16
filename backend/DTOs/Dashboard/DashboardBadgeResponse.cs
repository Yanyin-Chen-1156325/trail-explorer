using backend.Enums;

namespace backend.DTOs.Dashboard;

public record DashboardBadgeResponse(
    Guid Id,
    string Name,
    string Description,
    string IconUrl,
    BadgeType Type,
    DateTime UnlockedAt);
