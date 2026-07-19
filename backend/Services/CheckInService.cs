using backend.Data;
using backend.DTOs.CheckIn;
using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CheckInService : ICheckInService
{
    private readonly ApplicationDbContext _context;
    private readonly IBadgeUnlockService _badgeUnlockService;
    private readonly ILeaderboardNotificationService _leaderboardNotificationService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<CheckInService> _logger;

    public CheckInService(
        ApplicationDbContext context,
        IBadgeUnlockService badgeUnlockService,
        ILeaderboardNotificationService leaderboardNotificationService,
        INotificationService notificationService,
        ILogger<CheckInService> logger)
    {
        _context = context;
        _badgeUnlockService = badgeUnlockService;
        _leaderboardNotificationService = leaderboardNotificationService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<CheckInResponse> CreateCheckInAsync(Guid userId, CreateCheckInRequest request)
    {
        var trailExists = await _context.Trails
            .AsNoTracking()
            .AnyAsync(trail => trail.Id == request.TrailId && trail.IsActive);

        if (!trailExists)
        {
            throw new KeyNotFoundException("Trail not found");
        }

        var checkIn = new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrailId = request.TrailId,
            CompletedDate = request.CompletedDate,
            Notes = request.Notes?.Trim(),
            PhotoUrl = request.PhotoUrl?.Trim()
        };

        _context.CheckIns.Add(checkIn);
        await _context.SaveChangesAsync();
        var notificationCreatedAt = DateTime.UtcNow;
        var unlockedBadges = await _badgeUnlockService.UnlockEligibleBadgesAsync(userId);

        await _notificationService.CreateAchievementNotificationsAsync(
            userId,
            checkIn.Id,
            unlockedBadges,
            notificationCreatedAt);

        if (unlockedBadges.Count > 0)
        {
            await _leaderboardNotificationService.BroadcastBadgeUnlocksAsync(
                userId,
                unlockedBadges,
                notificationCreatedAt);
        }
        else
        {
            await _leaderboardNotificationService.BroadcastLeaderboardChangedAsync(userId);
        }

        _logger.LogInformation(
            "Trail completed: {CheckInId} by user {UserId} on trail {TrailId} at {CompletedDate}",
            checkIn.Id,
            checkIn.UserId,
            checkIn.TrailId,
            checkIn.CompletedDate);

        return ToCheckInResponse(checkIn);
    }

    public async Task<CheckInResponse> UpdateCheckInAsync(
        Guid checkInId,
        Guid userId,
        UpdateCheckInRequest request)
    {
        var checkIn = await _context.CheckIns
            .FirstOrDefaultAsync(x => x.Id == checkInId);

        if (checkIn is null)
        {
            throw new KeyNotFoundException("Check-in not found");
        }

        if (checkIn.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only update your own check-ins");
        }

        checkIn.CompletedDate = request.CompletedDate;
        checkIn.Notes = request.Notes?.Trim();
        checkIn.PhotoUrl = request.PhotoUrl?.Trim();

        await _context.SaveChangesAsync();
        await _leaderboardNotificationService.BroadcastLeaderboardChangedAsync(userId);

        return ToCheckInResponse(checkIn);
    }

    public async Task DeleteCheckInAsync(Guid checkInId, Guid userId)
    {
        var checkIn = await _context.CheckIns
            .FirstOrDefaultAsync(x => x.Id == checkInId);

        if (checkIn is null)
        {
            throw new KeyNotFoundException("Check-in not found");
        }

        if (checkIn.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own check-ins");
        }

        var removedUserId = checkIn.UserId;
        _context.CheckIns.Remove(checkIn);
        await _context.SaveChangesAsync();
        await _leaderboardNotificationService.BroadcastLeaderboardChangedAsync(removedUserId);
    }

    public async Task<IReadOnlyList<CheckInResponse>> GetUserCheckInHistoryAsync(Guid userId)
    {
        return await _context.CheckIns
            .AsNoTracking()
            .Where(x => x.UserId == userId && !x.IsHidden)
            .OrderByDescending(x => x.CompletedDate)
            .ThenBy(x => x.Id)
            .Select(x => ToCheckInResponse(x))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<CheckInResponse>> GetAllCheckInsAsync()
    {
        return await _context.CheckIns
            .AsNoTracking()
            .OrderByDescending(x => x.CompletedDate)
            .ThenBy(x => x.Id)
            .Select(x => ToCheckInResponse(x))
            .ToListAsync();
    }

    public async Task<CheckInResponse> HideCheckInAsync(Guid checkInId)
    {
        var checkIn = await _context.CheckIns
            .FirstOrDefaultAsync(x => x.Id == checkInId);

        if (checkIn is null)
        {
            throw new KeyNotFoundException("Check-in not found");
        }

        checkIn.IsHidden = true;

        await _context.SaveChangesAsync();
        await _leaderboardNotificationService.BroadcastLeaderboardChangedAsync(checkIn.UserId);

        return ToCheckInResponse(checkIn);
    }

    public async Task<CheckInResponse> RestoreCheckInAsync(Guid checkInId)
    {
        var checkIn = await _context.CheckIns
            .FirstOrDefaultAsync(x => x.Id == checkInId);

        if (checkIn is null)
        {
            throw new KeyNotFoundException("Check-in not found");
        }

        checkIn.IsHidden = false;

        await _context.SaveChangesAsync();
        await _leaderboardNotificationService.BroadcastLeaderboardChangedAsync(checkIn.UserId);

        return ToCheckInResponse(checkIn);
    }

    private static CheckInResponse ToCheckInResponse(CheckIn checkIn)
    {
        return new CheckInResponse
        {
            Id = checkIn.Id,
            UserId = checkIn.UserId,
            TrailId = checkIn.TrailId,
            CompletedDate = checkIn.CompletedDate,
            Notes = checkIn.Notes,
            PhotoUrl = checkIn.PhotoUrl,
            IsHidden = checkIn.IsHidden
        };
    }
}
