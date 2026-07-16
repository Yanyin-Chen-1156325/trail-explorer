using backend.Enums;

namespace backend.Entities;

public class Badge
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IconUrl { get; set; } = string.Empty;

    public BadgeType Type { get; set; }
}
