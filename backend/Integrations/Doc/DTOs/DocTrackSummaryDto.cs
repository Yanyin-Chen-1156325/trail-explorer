using System.Text.Json.Serialization;

namespace backend.Integrations.Doc.DTOs;

public class DocTrackSummaryDto
{
    [JsonPropertyName("assetId")]
    public string? AssetId { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("region")]
    public List<string>? Region { get; set; }

    [JsonPropertyName("x")]
    public double? X { get; set; }

    [JsonPropertyName("y")]
    public double? Y { get; set; }

    [JsonPropertyName("line")]
    public List<List<List<double>>>? Line { get; set; }
}
