using backend.Enums;

namespace backend.DTOs.Badge;

public class BadgeResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IconUrl { get; set; } = string.Empty;

    public BadgeType Type { get; set; }

    public bool IsUnlocked { get; set; }

    public DateTime? UnlockedAt { get; set; }

    public decimal CurrentValue { get; set; }

    public decimal TargetValue { get; set; }

    public string ProgressLabel { get; set; } = string.Empty;
}
