using System.Net;
using backend.Integrations.Doc;
using Microsoft.Extensions.Options;

namespace backend.Tests.Integration.Doc;

public class DocApiClientTests
{
    [Fact]
    public async Task GetTracksAsync_SendsApiKeyAndReturnsTrackSummaries()
    {
        var handler = new CapturingHandler(
            """
            [
              {
                "assetId": "track-1",
                "name": "Sample Track",
                "region": ["Canterbury"],
                "x": 1572954.6221,
                "y": 5150889.4148,
                "line": [[[1567114.8592, 5158021.8518]]]
              }
            ]
            """);
        var client = CreateClient(handler, new DocApiOptions
        {
            BaseUrl = "https://api.doc.govt.nz",
            ApiKey = "test-api-key"
        });

        var result = await client.GetTracksAsync();

        var track = Assert.Single(result);
        Assert.Equal("track-1", track.AssetId);
        Assert.Equal("Sample Track", track.Name);
        Assert.Equal("Canterbury", Assert.Single(track.Region!));
        Assert.Equal(1572954.6221, track.X);
        Assert.Equal(5150889.4148, track.Y);
        Assert.NotNull(track.Line);
        Assert.Equal(HttpMethod.Get, handler.Method);
        Assert.Equal("https://api.doc.govt.nz/v1/tracks", handler.RequestUri);
        Assert.Equal("test-api-key", handler.ApiKey);
    }

    [Fact]
    public async Task GetTrackDetailAsync_SendsDetailRequestAndReturnsDetail()
    {
        var handler = new CapturingHandler(
            """
            {
              "assetId": "track-1",
              "name": "Christchurch to Little River Rail Trail",
              "introduction": "Trail introduction",
              "introductionThumbnail": "https://example.test/thumb.jpg",
              "permittedActivities": ["Mountain biking", "Walking and tramping"],
              "distance": "20 km",
              "walkDuration": null,
              "walkDurationCategory": ["1-4 hours"],
              "walkTrackCategory": ["Easy"],
              "wheelchairsAndBuggies": true,
              "mtbDuration": null,
              "mtbDurationCategory": ["Under 4 hours"],
              "mtbTrackCategory": ["Easiest"],
              "kayakingDuration": null,
              "dogsAllowed": "No dogs.",
              "locationString": "Located in Christchurch area",
              "locationArray": ["Christchurch area"],
              "region": ["Canterbury"],
              "staticLink": "https://www.doc.govt.nz/link/track-1.aspx",
              "x": 1572954.6221,
              "y": 5150889.4148,
              "line": [[[1567114.8592, 5158021.8518]]]
            }
            """);
        var client = CreateClient(handler, new DocApiOptions
        {
            BaseUrl = "https://api.doc.govt.nz",
            ApiKey = "test-api-key"
        });

        var result = await client.GetTrackDetailAsync("track-1");

        Assert.NotNull(result);
        Assert.Equal("track-1", result.AssetId);
        Assert.Equal("Christchurch to Little River Rail Trail", result.Name);
        Assert.Equal("Trail introduction", result.Introduction);
        Assert.Equal("20 km", result.Distance);
        Assert.Equal("Easy", Assert.Single(result.WalkTrackCategory!));
        Assert.Equal("Christchurch area", Assert.Single(result.LocationArray!));
        Assert.Equal("Canterbury", Assert.Single(result.Region!));
        Assert.True(result.WheelchairsAndBuggies?.GetBoolean());
        Assert.NotNull(result.Line);
        Assert.Equal("https://api.doc.govt.nz/v1/tracks/track-1/detail", handler.RequestUri);
    }

    [Fact]
    public async Task GetTracksAsync_ThrowsWhenApiKeyIsMissing()
    {
        var handler = new CapturingHandler("""[]""");
        var client = CreateClient(handler, new DocApiOptions
        {
            BaseUrl = "https://api.doc.govt.nz",
            ApiKey = ""
        });

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => client.GetTracksAsync());

        Assert.Equal("DOC API key is not configured.", exception.Message);
        Assert.Null(handler.Request);
    }

    [Fact]
    public async Task GetTrackDetailAsync_ThrowsWhenAssetIdIsMissing()
    {
        var handler = new CapturingHandler("""{}""");
        var client = CreateClient(handler, new DocApiOptions
        {
            BaseUrl = "https://api.doc.govt.nz",
            ApiKey = "test-api-key"
        });

        await Assert.ThrowsAsync<ArgumentException>(() => client.GetTrackDetailAsync(""));
        Assert.Null(handler.Request);
    }

    private static DocApiClient CreateClient(HttpMessageHandler handler, DocApiOptions options)
    {
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri(options.BaseUrl),
            Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds)
        };

        return new DocApiClient(httpClient, Options.Create(options));
    }

    private sealed class CapturingHandler : HttpMessageHandler
    {
        private readonly string _body;

        public HttpRequestMessage? Request { get; private set; }

        public HttpMethod? Method { get; private set; }

        public string? RequestUri { get; private set; }

        public string? ApiKey { get; private set; }

        public CapturingHandler(string body)
        {
            _body = body;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            Request = request;
            Method = request.Method;
            RequestUri = request.RequestUri?.ToString();
            ApiKey = request.Headers.TryGetValues("x-api-key", out var values)
                ? values.SingleOrDefault()
                : null;

            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(_body)
            };

            return Task.FromResult(response);
        }
    }
}
