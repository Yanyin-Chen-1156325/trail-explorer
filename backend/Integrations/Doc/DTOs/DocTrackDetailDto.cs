using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Integrations.Doc.DTOs;

public class DocTrackDetailDto
{
    [JsonPropertyName("assetId")]
    public string? AssetId { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("introduction")]
    public string? Introduction { get; set; }

    [JsonPropertyName("introductionThumbnail")]
    public string? IntroductionThumbnail { get; set; }

    [JsonPropertyName("permittedActivities")]
    public List<string>? PermittedActivities { get; set; }

    [JsonPropertyName("distance")]
    public string? Distance { get; set; }

    [JsonPropertyName("walkDuration")]
    public JsonElement? WalkDuration { get; set; }

    [JsonPropertyName("walkDurationCategory")]
    public List<string>? WalkDurationCategory { get; set; }

    [JsonPropertyName("walkTrackCategory")]
    public List<string>? WalkTrackCategory { get; set; }

    [JsonPropertyName("wheelchairsAndBuggies")]
    public JsonElement? WheelchairsAndBuggies { get; set; }

    [JsonPropertyName("mtbDuration")]
    public JsonElement? MtbDuration { get; set; }

    [JsonPropertyName("mtbDurationCategory")]
    public List<string>? MtbDurationCategory { get; set; }

    [JsonPropertyName("mtbTrackCategory")]
    public List<string>? MtbTrackCategory { get; set; }

    [JsonPropertyName("kayakingDuration")]
    public JsonElement? KayakingDuration { get; set; }

    [JsonPropertyName("dogsAllowed")]
    public string? DogsAllowed { get; set; }

    [JsonPropertyName("locationString")]
    public string? LocationString { get; set; }

    [JsonPropertyName("locationArray")]
    public List<string>? LocationArray { get; set; }

    [JsonPropertyName("region")]
    public List<string>? Region { get; set; }

    [JsonPropertyName("staticLink")]
    public string? StaticLink { get; set; }

    [JsonPropertyName("x")]
    public double? X { get; set; }

    [JsonPropertyName("y")]
    public double? Y { get; set; }

    [JsonPropertyName("line")]
    public List<List<List<double>>>? Line { get; set; }
}
