namespace backend.DTOs.CheckIn;

public class CreateCheckInRequest
{
    public Guid TrailId { get; set; }

    public DateTime CompletedDate { get; set; }

    public string? Notes { get; set; }

    public string? PhotoUrl { get; set; }
}
