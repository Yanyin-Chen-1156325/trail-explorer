namespace backend.BackgroundServices;

public class TrailSynchronisationOptions
{
    public const string SectionName = "TrailSynchronisation";

    public bool Enabled { get; set; }

    public bool RunOnStartup { get; set; }

    public int IntervalHours { get; set; } = 24;
}
