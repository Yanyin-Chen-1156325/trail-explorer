using System.Text.Json;
using Xunit.Abstractions;

namespace backend.Tests.Integration.Doc;

public class DocTracksApiProbeTests
{
    private const string ChristchurchToLittleRiverRailTrailId =
        "c68bd6a5-a00d-4242-940e-21acec0afa20";

    private readonly ITestOutputHelper _output;

    public DocTracksApiProbeTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    [Trait("Category", "ExternalDocApi")]
    public async Task GetTracks_WritesResponseSample()
    {
        using var client = CreateDocClient();

        if (client is null)
        {
            return;
        }

        using var response = await client.GetAsync("/v1/tracks");
        var body = await response.Content.ReadAsStringAsync();

        _output.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase}");
        _output.WriteLine($"Content-Type: {response.Content.Headers.ContentType}");
        _output.WriteLine($"Body length: {body.Length}");

        var outputDirectory = Path.Combine(AppContext.BaseDirectory, "TestResults");
        Directory.CreateDirectory(outputDirectory);
        var outputPath = Path.Combine(outputDirectory, "doc-v1-tracks-sample.json");
        await File.WriteAllTextAsync(outputPath, body);

        _output.WriteLine($"Full response written to: {outputPath}");
        WriteJsonShape(body);

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    [Trait("Category", "ExternalDocApi")]
    public async Task GetTrackDetail_WritesResponseSample()
    {
        using var client = CreateDocClient();

        if (client is null)
        {
            return;
        }

        var trackId = Environment.GetEnvironmentVariable("DOC_TRACK_ID");

        if (string.IsNullOrWhiteSpace(trackId))
        {
            trackId = ChristchurchToLittleRiverRailTrailId;
        }

        using var response = await client.GetAsync($"/v1/tracks/{trackId}/detail");
        var body = await response.Content.ReadAsStringAsync();

        _output.WriteLine($"Track ID: {trackId}");
        _output.WriteLine($"Status: {(int)response.StatusCode} {response.ReasonPhrase}");
        _output.WriteLine($"Content-Type: {response.Content.Headers.ContentType}");
        _output.WriteLine($"Body length: {body.Length}");

        var outputDirectory = Path.Combine(AppContext.BaseDirectory, "TestResults");
        Directory.CreateDirectory(outputDirectory);
        var outputPath = Path.Combine(outputDirectory, $"doc-v1-track-detail-{trackId}.json");
        await File.WriteAllTextAsync(outputPath, body);

        _output.WriteLine($"Full response written to: {outputPath}");
        WriteJsonShape(body);

        response.EnsureSuccessStatusCode();
    }

    private HttpClient? CreateDocClient()
    {
        var apiKey = Environment.GetEnvironmentVariable("DOC_API_KEY");

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _output.WriteLine("DOC_API_KEY is not set. Set it to call api.doc.govt.nz/v1/tracks.");
            return null;
        }

        var baseUrl = Environment.GetEnvironmentVariable("DOC_API_BASE_URL");

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            baseUrl = "https://api.doc.govt.nz/v1";
        }

        var client = new HttpClient
        {
            BaseAddress = new Uri(baseUrl),
            Timeout = TimeSpan.FromSeconds(30)
        };
        client.DefaultRequestHeaders.Add("x-api-key", apiKey);

        return client;
    }

    private void WriteJsonShape(string body)
    {
        try
        {
            using var document = JsonDocument.Parse(body);
            var root = document.RootElement;

            _output.WriteLine($"Root JSON kind: {root.ValueKind}");

            if (root.ValueKind == JsonValueKind.Array)
            {
                _output.WriteLine($"Root array count: {root.GetArrayLength()}");
                WriteSampleObject(root.EnumerateArray().FirstOrDefault());
                return;
            }

            if (root.ValueKind == JsonValueKind.Object)
            {
                var properties = root.EnumerateObject().Select(property => property.Name).ToArray();
                _output.WriteLine($"Root properties: {string.Join(", ", properties)}");

                foreach (var property in root.EnumerateObject())
                {
                    if (property.Value.ValueKind != JsonValueKind.Array)
                    {
                        continue;
                    }

                    _output.WriteLine($"Array property '{property.Name}' count: {property.Value.GetArrayLength()}");
                    WriteSampleObject(property.Value.EnumerateArray().FirstOrDefault());
                    return;
                }
            }
        }
        catch (JsonException ex)
        {
            _output.WriteLine($"Response is not valid JSON: {ex.Message}");
            _output.WriteLine(body[..Math.Min(body.Length, 1000)]);
        }
    }

    private void WriteSampleObject(JsonElement sample)
    {
        if (sample.ValueKind == JsonValueKind.Undefined)
        {
            _output.WriteLine("No sample item found.");
            return;
        }

        if (sample.ValueKind != JsonValueKind.Object)
        {
            _output.WriteLine($"Sample item kind: {sample.ValueKind}");
            return;
        }

        _output.WriteLine("Sample item fields:");

        foreach (var property in sample.EnumerateObject())
        {
            var preview = property.Value.ValueKind switch
            {
                JsonValueKind.String => property.Value.GetString(),
                JsonValueKind.Number => property.Value.GetRawText(),
                JsonValueKind.True => "true",
                JsonValueKind.False => "false",
                JsonValueKind.Null => "null",
                _ => property.Value.ValueKind.ToString()
            };

            if (preview is not null && preview.Length > 120)
            {
                preview = $"{preview[..120]}...";
            }

            _output.WriteLine($"- {property.Name}: {property.Value.ValueKind} = {preview}");
        }
    }
}
