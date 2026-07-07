using backend.Services;

namespace backend.Tests.Services;

public class CoordinateConversionServiceTests
{
    [Fact]
    public void ConvertNztmToWgs84_WithDocSampleCoordinate_ReturnsCanterburyCoordinate()
    {
        var coordinates = CoordinateConversionService.ConvertNztmToWgs84(
            1572954.6221,
            5150889.4148);

        Assert.NotNull(coordinates);
        Assert.InRange(coordinates.Value.Latitude, -44.0, -43.0);
        Assert.InRange(coordinates.Value.Longitude, 172.0, 173.5);
    }

    [Fact]
    public void ConvertNztmToWgs84_WithMissingCoordinate_ReturnsNull()
    {
        Assert.Null(CoordinateConversionService.ConvertNztmToWgs84(null, 5150889.4148));
        Assert.Null(CoordinateConversionService.ConvertNztmToWgs84(1572954.6221, null));
    }
}
