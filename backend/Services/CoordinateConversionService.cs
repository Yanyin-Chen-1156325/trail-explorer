namespace backend.Services;

public static class CoordinateConversionService
{
    private const double SemiMajorAxis = 6378137;
    private const double InverseFlattening = 298.257222101;
    private const double CentralMeridianDegrees = 173;
    private const double FalseEasting = 1600000;
    private const double FalseNorthing = 10000000;
    private const double ScaleFactor = 0.9996;

    public static (double Latitude, double Longitude)? ConvertNztmToWgs84(
        double? easting,
        double? northing)
    {
        if (!easting.HasValue || !northing.HasValue)
        {
            return null;
        }

        var flattening = 1 / InverseFlattening;
        var eccentricitySquared = 2 * flattening - flattening * flattening;
        var secondEccentricitySquared = eccentricitySquared / (1 - eccentricitySquared);
        var e1 = (1 - Math.Sqrt(1 - eccentricitySquared)) /
            (1 + Math.Sqrt(1 - eccentricitySquared));

        var x = easting.Value - FalseEasting;
        var y = northing.Value - FalseNorthing;
        var meridionalArc = y / ScaleFactor;
        var mu = meridionalArc /
            (SemiMajorAxis *
                (1 - eccentricitySquared / 4 -
                    3 * Math.Pow(eccentricitySquared, 2) / 64 -
                    5 * Math.Pow(eccentricitySquared, 3) / 256));

        var footpointLatitude =
            mu +
            (3 * e1 / 2 - 27 * Math.Pow(e1, 3) / 32) * Math.Sin(2 * mu) +
            (21 * Math.Pow(e1, 2) / 16 - 55 * Math.Pow(e1, 4) / 32) * Math.Sin(4 * mu) +
            (151 * Math.Pow(e1, 3) / 96) * Math.Sin(6 * mu) +
            (1097 * Math.Pow(e1, 4) / 512) * Math.Sin(8 * mu);

        var sinFootpointLatitude = Math.Sin(footpointLatitude);
        var cosFootpointLatitude = Math.Cos(footpointLatitude);
        var tangentFootpointLatitude = Math.Tan(footpointLatitude);
        var n1 = SemiMajorAxis /
            Math.Sqrt(1 - eccentricitySquared * Math.Pow(sinFootpointLatitude, 2));
        var r1 = SemiMajorAxis * (1 - eccentricitySquared) /
            Math.Pow(1 - eccentricitySquared * Math.Pow(sinFootpointLatitude, 2), 1.5);
        var t1 = Math.Pow(tangentFootpointLatitude, 2);
        var c1 = secondEccentricitySquared * Math.Pow(cosFootpointLatitude, 2);
        var d = x / (n1 * ScaleFactor);

        var latitudeRadians =
            footpointLatitude -
            (n1 * tangentFootpointLatitude / r1) *
            (Math.Pow(d, 2) / 2 -
                (5 + 3 * t1 + 10 * c1 - 4 * Math.Pow(c1, 2) - 9 * secondEccentricitySquared) *
                Math.Pow(d, 4) / 24 +
                (61 + 90 * t1 + 298 * c1 + 45 * Math.Pow(t1, 2) -
                    252 * secondEccentricitySquared - 3 * Math.Pow(c1, 2)) *
                Math.Pow(d, 6) / 720);

        var longitudeRadians =
            DegreesToRadians(CentralMeridianDegrees) +
            (d -
                (1 + 2 * t1 + c1) * Math.Pow(d, 3) / 6 +
                (5 - 2 * c1 + 28 * t1 - 3 * Math.Pow(c1, 2) +
                    8 * secondEccentricitySquared + 24 * Math.Pow(t1, 2)) *
                Math.Pow(d, 5) / 120) /
            cosFootpointLatitude;

        return (RadiansToDegrees(latitudeRadians), RadiansToDegrees(longitudeRadians));
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }

    private static double RadiansToDegrees(double radians)
    {
        return radians * 180 / Math.PI;
    }
}
