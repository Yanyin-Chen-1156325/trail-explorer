using backend.BackgroundServices;
using backend.Authentication;
using backend.Data;
using backend.Enums;
using backend.Hubs;
using backend.Integrations.Doc;
using backend.Services;
using backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

if (builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("Postgres"),
            npgsqlOptions =>
            {
                npgsqlOptions.MigrationsHistoryTable(
                    "__EFMigrationsHistory",
                    "trail_explorer");
            }));
}

// Add Authentication Services
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
    ?? throw new InvalidOperationException("JWT configuration is missing");

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<GoogleOAuthOptions>(builder.Configuration.GetSection("GoogleOAuth"));
builder.Services.Configure<DocApiOptions>(builder.Configuration.GetSection(DocApiOptions.SectionName));
builder.Services.Configure<TrailSynchronisationOptions>(
    builder.Configuration.GetSection(TrailSynchronisationOptions.SectionName));
builder.Services.AddSingleton(jwtOptions);
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IGoogleTokenValidator, GoogleTokenValidator>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<ITrailCacheInvalidator, TrailCacheInvalidator>();
builder.Services.AddScoped<ITrailService, TrailService>();
builder.Services.AddScoped<ICheckInService, CheckInService>();
builder.Services.AddScoped<IXpCalculatorService, XpCalculatorService>();
builder.Services.AddScoped<ILevelCalculatorService, LevelCalculatorService>();
builder.Services.AddScoped<IUserProgressService, UserProgressService>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IStreakCalculatorService, StreakCalculatorService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<ILeaderboardNotificationService, LeaderboardNotificationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IBadgeEvaluationService, BadgeEvaluationService>();
builder.Services.AddScoped<IBadgeUnlockService, BadgeUnlockService>();
builder.Services.AddScoped<IBadgeService, BadgeService>();
builder.Services.AddScoped<INotificationBroadcastService, NotificationBroadcastService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ITrailSyncService, TrailSyncService>();
builder.Services.AddScoped<IDocTrailIntegrationService, DocTrailIntegrationService>();
builder.Services.AddHttpClient<IDocApiClient, DocApiClient>((serviceProvider, client) =>
{
    var options = serviceProvider.GetRequiredService<IOptions<DocApiOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl);
    client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
});
builder.Services.AddHostedService<TrailSynchronisationBackgroundService>();

// Add Validation
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtOptions.Issuer,
        ValidAudience = jwtOptions.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret))
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/hubs/leaderboard") ||
                path.StartsWithSegments("/hubs/notifications")))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.AdminOnly, policy =>
        policy.RequireRole(UserRole.Admin.ToString()));

    options.AddPolicy(AuthorizationPolicies.ModeratorOrAdmin, policy =>
        policy.RequireRole(UserRole.Moderator.ToString(), UserRole.Admin.ToString()));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add Controllers
builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext =
        scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    if (app.Environment.IsEnvironment("Testing"))
    {
        dbContext.Database.EnsureCreated();
    }
    else
    {
        dbContext.Database.Migrate();
    }

    if (app.Environment.IsDevelopment())
    {
        await DevelopmentDataSeeder.SeedAsync(dbContext);
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference();

    app.UseCors("DevelopmentFrontend");
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<LeaderboardHub>("/hubs/leaderboard");
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();

public partial class Program
{
}
