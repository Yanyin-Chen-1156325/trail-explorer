using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations;

public class TrailConfiguration : IEntityTypeConfiguration<Trail>
{
    public void Configure(EntityTypeBuilder<Trail> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.DocId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.City)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(x => x.Region)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(x => x.DistanceKm)
            .HasPrecision(8, 2);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(x => x.ImageUrl)
            .HasMaxLength(2048);

        builder.Property(x => x.CoordinateX);

        builder.Property(x => x.CoordinateY);

        builder.Property(x => x.Latitude);

        builder.Property(x => x.Longitude);
    }
}
