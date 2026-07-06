using System.Text.Json;
using backend.Integrations.Doc.DTOs;
using Microsoft.Extensions.Options;

namespace backend.Integrations.Doc;

public class DocApiClient : IDocApiClient
{
    private const string ApiKeyHeaderName = "x-api-key";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly DocApiOptions _options;

    public DocApiClient(HttpClient httpClient, IOptions<DocApiOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<IReadOnlyList<DocTrackSummaryDto>> GetTracksAsync(
        CancellationToken cancellationToken = default)
    {
        var json = await GetJsonAsync("/v1/tracks", cancellationToken);

        return JsonSerializer.Deserialize<List<DocTrackSummaryDto>>(json, JsonOptions) ?? [];
    }

    public async Task<DocTrackDetailDto?> GetTrackDetailAsync(
        string assetId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(assetId))
        {
            throw new ArgumentException("DOC track asset ID is required.", nameof(assetId));
        }

        var json = await GetJsonAsync($"/v1/tracks/{Uri.EscapeDataString(assetId)}/detail", cancellationToken);

        return JsonSerializer.Deserialize<DocTrackDetailDto>(json, JsonOptions);
    }

    private async Task<string> GetJsonAsync(string requestUri, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("DOC API key is not configured.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
        request.Headers.Add(ApiKeyHeaderName, _options.ApiKey);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync(cancellationToken);
    }
}
