using System;
using Microsoft.EntityFrameworkCore;
using Backend.Models.Entities;
using Backend.Models.Enums;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(builder =>
            {
                builder.ToTable("Users");
                builder.HasKey(u => u.Id);

                builder.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                builder.HasIndex(u => u.Email)
                    .IsUnique();

                builder.Property(u => u.DisplayName)
                    .HasMaxLength(100);

                builder.Property(u => u.PasswordHash)
                    .IsRequired();

                builder.Property(u => u.Role)
                    .HasConversion<int>()
                    .IsRequired();

                builder.Property(u => u.Status)
                    .HasConversion<int>()
                    .IsRequired();

                builder.Property(u => u.AuthProvider)
                    .HasConversion<int>()
                    .IsRequired();

                builder.Property(u => u.ProviderUserId)
                    .HasMaxLength(200);

                builder.Property(u => u.CreatedAt)
                    .IsRequired();

                builder.Property(u => u.UpdatedAt)
                    .IsRequired();

                // Relationships
                builder.HasMany(u => u.CheckIns)
                    .WithOne(ci => ci.User)
                    .HasForeignKey(ci => ci.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                builder.HasMany(u => u.UserBadges)
                    .WithOne(ub => ub.User)
                    .HasForeignKey(ub => ub.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                builder.HasMany(u => u.RefreshTokens)
                    .WithOne(rt => rt.User)
                    .HasForeignKey(rt => rt.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
