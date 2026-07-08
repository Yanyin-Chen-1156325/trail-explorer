namespace backend.Entities;

public class CheckIn
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid TrailId { get; set; }

    public DateTime CompletedDate { get; set; }

    public string? Notes { get; set; }

    public string? PhotoUrl { get; set; }

    public bool IsHidden { get; set; }

    public User User { get; set; } = null!;

    public Trail Trail { get; set; } = null!;
}
