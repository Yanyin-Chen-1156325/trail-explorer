namespace backend.DTOs.CheckIn;

public class UpdateCheckInRequest
{
    public DateTime CompletedDate { get; set; }

    public string? Notes { get; set; }

    public string? PhotoUrl { get; set; }
}
