using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DevelopmentDataSeeder
{
    private const string AdminEmail = "admin1@example.com";
    private const string AdminPassword = "1qaz@WSX";
    private const string AdminDisplayName = "admin1";

    public static async Task SeedAsync(ApplicationDbContext dbContext)
    {
        var hasChanges = false;

        var adminUser = await dbContext.Users
            .FirstOrDefaultAsync(user => user.Email == AdminEmail);

        if (adminUser is null)
        {
            var now = DateTime.UtcNow;

            dbContext.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = AdminEmail,
                DisplayName = AdminDisplayName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword),
                Role = UserRole.Admin,
                Status = UserStatus.Active,
                AuthProvider = AuthProvider.Local,
                CreatedAt = now,
                UpdatedAt = now
            });

            hasChanges = true;
        }
        else
        {
            if (adminUser.Role != UserRole.Admin)
            {
                adminUser.Role = UserRole.Admin;
                hasChanges = true;
            }

            if (adminUser.Status != UserStatus.Active)
            {
                adminUser.Status = UserStatus.Active;
                hasChanges = true;
            }

            if (hasChanges)
            {
                adminUser.UpdatedAt = DateTime.UtcNow;
            }
        }

        var existingBadgeNames = await dbContext.Badges
            .Select(badge => badge.Name)
            .ToListAsync();

        var existingBadgeNameSet = existingBadgeNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var badgesToAdd = BadgeRuleCatalog.BadgeDefinitions
            .Where(badge => !existingBadgeNameSet.Contains(badge.Name))
            .Select(badge => new Badge
            {
                Id = Guid.NewGuid(),
                Name = badge.Name,
                Description = badge.Description,
                IconUrl = badge.IconUrl,
                Type = badge.Type
            })
            .ToList();

        if (badgesToAdd.Count > 0)
        {
            dbContext.Badges.AddRange(badgesToAdd);
            hasChanges = true;
        }

        if (hasChanges)
        {
            await dbContext.SaveChangesAsync();
        }
    }
}
