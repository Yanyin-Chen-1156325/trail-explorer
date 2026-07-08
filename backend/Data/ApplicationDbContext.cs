using backend.Configurations;
using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;

    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    public DbSet<Trail> Trails { get; set; } = null!;

    public DbSet<CheckIn> CheckIns { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
        modelBuilder.ApplyConfiguration(new TrailConfiguration());
        modelBuilder.ApplyConfiguration(new CheckInConfiguration());
    }
}
