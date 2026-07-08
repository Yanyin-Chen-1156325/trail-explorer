using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations;

public class CheckInConfiguration : IEntityTypeConfiguration<CheckIn>
{
    public void Configure(EntityTypeBuilder<CheckIn> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompletedDate)
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        builder.Property(x => x.PhotoUrl)
            .HasMaxLength(2048);

        builder.Property(x => x.IsHidden)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasOne(x => x.User)
            .WithMany(x => x.CheckIns)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Trail)
            .WithMany(x => x.CheckIns)
            .HasForeignKey(x => x.TrailId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
