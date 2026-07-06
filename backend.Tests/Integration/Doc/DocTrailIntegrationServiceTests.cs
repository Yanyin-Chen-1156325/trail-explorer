using backend.Integrations.Doc;
using backend.Integrations.Doc.DTOs;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace backend.Tests.Integration.Doc;

public class DocTrailIntegrationServiceTests
{
    [Fact]
    public async Task GetImportCandidatesAsync_FiltersByRegionThenLocationAndMapsCandidate()
    {
        var client = new FakeDocApiClient(
            [
                new DocTrackSummaryDto
                {
                    AssetId = "canterbury-1",
                    Name = "Canterbury Track",
                    Region = ["Canterbury"],
                    X = 1,
                    Y = 2
                },
                new DocTrackSummaryDto
                {
                    AssetId = "otago-1",
                    Name = "Otago Track",
                    Region = ["Otago"]
                }
            ],
            new Dictionary<string, DocTrackDetailDto?>
            {
                ["canterbury-1"] = new()
                {
                    AssetId = "canterbury-1",
                    Name = "Christchurch to Little River Rail Trail",
                    Introduction = "Trail introduction",
                    Distance = "20 km",
                    WalkTrackCategory = ["Easy"],
                    LocationArray = ["Christchurch area"],
                    Region = ["Canterbury"],
                    StaticLink = "https://www.doc.govt.nz/link/canterbury-1.aspx",
                    X = 3,
                    Y = 4
                }
            });
        var service = CreateService(client);

        var result = await service.GetImportCandidatesAsync();

        var candidate = Assert.Single(result);
        Assert.Equal("canterbury-1", candidate.DocId);
        Assert.Equal("Christchurch to Little River Rail Trail", candidate.Name);
        Assert.Equal("Canterbury", candidate.Region);
        Assert.Equal("Christchurch area", candidate.CityOrLocation);
        Assert.Equal("Trail introduction", candidate.Description);
        Assert.Equal("20 km", candidate.DistanceText);
        Assert.Equal("Easy", candidate.DifficultyText);
        Assert.Equal("https://www.doc.govt.nz/link/canterbury-1.aspx", candidate.StaticLink);
        Assert.Equal(3, candidate.X);
        Assert.Equal(4, candidate.Y);
        Assert.Equal(["canterbury-1"], client.DetailRequests);
    }

    [Fact]
    public async Task GetImportCandidatesAsync_SkipsDetailsOutsideTargetLocation()
    {
        var client = new FakeDocApiClient(
            [
                new DocTrackSummaryDto
                {
                    AssetId = "canterbury-1",
                    Region = ["Canterbury"]
                }
            ],
            new Dictionary<string, DocTrackDetailDto?>
            {
                ["canterbury-1"] = new()
                {
                    AssetId = "canterbury-1",
                    Name = "Lake Track",
                    LocationArray = ["Lake Tekapo area"],
                    Region = ["Canterbury"]
                }
            });
        var service = CreateService(client);

        var result = await service.GetImportCandidatesAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetImportCandidatesAsync_SkipsFailedDetailRequests()
    {
        var client = new FakeDocApiClient(
            [
                new DocTrackSummaryDto
                {
                    AssetId = "failed-track",
                    Region = ["Canterbury"]
                }
            ],
            new Dictionary<string, DocTrackDetailDto?>(),
            failedDetailAssetIds: ["failed-track"]);
        var service = CreateService(client);

        var result = await service.GetImportCandidatesAsync();

        Assert.Empty(result);
        Assert.Equal(["failed-track"], client.DetailRequests);
    }

    [Fact]
    public async Task GetImportCandidatesAsync_SkipsNullDetailResponses()
    {
        var client = new FakeDocApiClient(
            [
                new DocTrackSummaryDto
                {
                    AssetId = "missing-detail",
                    Region = ["Canterbury"]
                }
            ],
            new Dictionary<string, DocTrackDetailDto?>
            {
                ["missing-detail"] = null
            });
        var service = CreateService(client);

        var result = await service.GetImportCandidatesAsync();

        Assert.Empty(result);
        Assert.Equal(["missing-detail"], client.DetailRequests);
    }

    [Fact]
    public async Task GetImportCandidatesAsync_DoesNotFilterWhenTargetsAreEmpty()
    {
        var client = new FakeDocApiClient(
            [
                new DocTrackSummaryDto
                {
                    AssetId = "otago-1",
                    Name = "Otago Track",
                    Region = ["Otago"]
                }
            ],
            new Dictionary<string, DocTrackDetailDto?>
            {
                ["otago-1"] = new()
                {
                    AssetId = "otago-1",
                    Name = "Otago Track",
                    LocationArray = ["Queenstown area"],
                    Region = ["Otago"]
                }
            });
        var service = CreateService(
            client,
            new DocApiOptions
            {
                TargetRegions = [],
                TargetLocationKeywords = []
            });

        var result = await service.GetImportCandidatesAsync();

        var candidate = Assert.Single(result);
        Assert.Equal("otago-1", candidate.DocId);
        Assert.Equal("Queenstown area", candidate.CityOrLocation);
        Assert.Equal(["otago-1"], client.DetailRequests);
    }

    [Fact]
    public async Task GetImportCandidatesAsync_ReturnsEmptyWhenTrackListRequestFails()
    {
        var client = new FakeDocApiClient(
            [],
            new Dictionary<string, DocTrackDetailDto?>(),
            failTrackList: true);
        var service = CreateService(client);

        var result = await service.GetImportCandidatesAsync();

        Assert.Empty(result);
    }

    private static DocTrailIntegrationService CreateService(
        FakeDocApiClient client,
        DocApiOptions? options = null)
    {
        return new DocTrailIntegrationService(
            client,
            Options.Create(options ?? new DocApiOptions
            {
                TargetRegions = ["Canterbury"],
                TargetLocationKeywords = ["Christchurch"]
            }),
            NullLogger<DocTrailIntegrationService>.Instance);
    }

    private sealed class FakeDocApiClient : IDocApiClient
    {
        private readonly IReadOnlyList<DocTrackSummaryDto> _tracks;
        private readonly IReadOnlyDictionary<string, DocTrackDetailDto?> _details;
        private readonly HashSet<string> _failedDetailAssetIds;
        private readonly bool _failTrackList;

        public List<string> DetailRequests { get; } = [];

        public FakeDocApiClient(
            IReadOnlyList<DocTrackSummaryDto> tracks,
            IReadOnlyDictionary<string, DocTrackDetailDto?> details,
            IReadOnlyCollection<string>? failedDetailAssetIds = null,
            bool failTrackList = false)
        {
            _tracks = tracks;
            _details = details;
            _failedDetailAssetIds = failedDetailAssetIds?.ToHashSet() ?? [];
            _failTrackList = failTrackList;
        }

        public Task<IReadOnlyList<DocTrackSummaryDto>> GetTracksAsync(
            CancellationToken cancellationToken = default)
        {
            if (_failTrackList)
            {
                throw new HttpRequestException("DOC tracks failed.");
            }

            return Task.FromResult(_tracks);
        }

        public Task<DocTrackDetailDto?> GetTrackDetailAsync(
            string assetId,
            CancellationToken cancellationToken = default)
        {
            DetailRequests.Add(assetId);

            if (_failedDetailAssetIds.Contains(assetId))
            {
                throw new HttpRequestException("DOC detail failed.");
            }

            _details.TryGetValue(assetId, out var detail);

            return Task.FromResult(detail);
        }
    }
}
