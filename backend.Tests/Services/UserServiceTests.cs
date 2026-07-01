using backend.Data;
using backend.DTOs.User;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests.Services;

public class UserServiceTests
{
    [Fact]
    public async Task GetUsersAsync_ReturnsUsersInDescendingCreatedOrder()
    {
        using var database = CreateDatabase();

        database.Context.Users.AddRange(
            CreateUser("older@example.com", "Older User", DateTime.UtcNow.AddDays(-2)),
            CreateUser("newer@example.com", "Newer User", DateTime.UtcNow.AddDays(-1)),
            CreateUser("newest@example.com", "Newest User", DateTime.UtcNow));

        await database.Context.SaveChangesAsync();

        var service = new UserService(database.Context);

        var users = await service.GetUsersAsync();

        Assert.Equal(3, users.Count);
        Assert.Equal("newest@example.com", users[0].Email);
        Assert.Equal("newer@example.com", users[1].Email);
        Assert.Equal("older@example.com", users[2].Email);
    }

    [Fact]
    public async Task UpdateUserRoleAsync_UpdatesRoleAndUpdatedAt()
    {
        using var database = CreateDatabase();
        var user = CreateUser("role@example.com", "Role User", DateTime.UtcNow.AddDays(-1));
        database.Context.Users.Add(user);
        await database.Context.SaveChangesAsync();

        var service = new UserService(database.Context);
        var beforeUpdate = user.UpdatedAt;

        var response = await service.UpdateUserRoleAsync(user.Id, new UpdateUserRoleRequest
        {
            Role = UserRole.Admin
        });

        Assert.Equal(UserRole.Admin, response.Role);
        Assert.Equal(UserRole.Admin, (await database.Context.Users.SingleAsync()).Role);
        Assert.True((await database.Context.Users.SingleAsync()).UpdatedAt >= beforeUpdate);
    }

    [Fact]
    public async Task UpdateUserRoleAsync_WhenUserDoesNotExist_ThrowsKeyNotFoundException()
    {
        using var database = CreateDatabase();
        var service = new UserService(database.Context);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.UpdateUserRoleAsync(Guid.NewGuid(), new UpdateUserRoleRequest
        {
            Role = UserRole.Admin
        }));
    }

    private static User CreateUser(string email, string displayName, DateTime createdAt)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = displayName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = createdAt,
            UpdatedAt = createdAt
        };
    }

    private static TestDatabase CreateDatabase()
    {
        return new TestDatabase();
    }

    private sealed class TestDatabase : IDisposable
    {
        private readonly SqliteConnection _connection;

        public TestDatabase()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection)
                .Options;

            Context = new ApplicationDbContext(options);
            Context.Database.EnsureCreated();
        }

        public ApplicationDbContext Context { get; }

        public void Dispose()
        {
            Context.Dispose();
            _connection.Dispose();
        }
    }
}