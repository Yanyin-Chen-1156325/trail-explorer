namespace backend.Integrations.Doc;

public class DocApiOptions
{
    public const string SectionName = "DocApi";

    public string BaseUrl { get; set; } = "https://api.doc.govt.nz";

    public string ApiKey { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 30;

    public string[] TargetRegions { get; set; } = [];

    public string[] TargetLocationKeywords { get; set; } = [];
}
