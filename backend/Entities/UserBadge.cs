namespace backend.Entities;

public class UserBadge
{
    public Guid UserId { get; set; }

    public Guid BadgeId { get; set; }

    public DateTime UnlockedAt { get; set; }

    public User User { get; set; } = null!;

    public Badge Badge { get; set; } = null!;
}
