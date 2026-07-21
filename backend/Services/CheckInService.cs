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
    private readonly IXpCalculatorService _xpCalculatorService;
    private readonly ILogger<CheckInService> _logger;

    public CheckInService(
        ApplicationDbContext context,
        IBadgeUnlockService badgeUnlockService,
        ILeaderboardNotificationService leaderboardNotificationService,
        INotificationService notificationService,
        IXpCalculatorService xpCalculatorService,
        ILogger<CheckInService> logger)
    {
        _context = context;
        _badgeUnlockService = badgeUnlockService;
        _leaderboardNotificationService = leaderboardNotificationService;
        _notificationService = notificationService;
        _xpCalculatorService = xpCalculatorService;
        _logger = logger;
    }

    public async Task<CheckInResponse> CreateCheckInAsync(Guid userId, CreateCheckInRequest request)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
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

        var createdNotifications = await _notificationService.CreateAchievementNotificationsAsync(
            userId,
            checkIn.Id,
            unlockedBadges,
            notificationCreatedAt) ?? [];

        await transaction.CommitAsync();
        await _notificationService.BroadcastCreatedNotificationsAsync(
            userId,
            createdNotifications);

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
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var checkIn = await _context.CheckIns
            .Include(x => x.Trail)
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
        var deductedXp = checkIn.IsHidden
            ? 0
            : _xpCalculatorService.CalculateXp(
                checkIn.Trail.DistanceKm,
                checkIn.Trail.Difficulty);
        _context.CheckIns.Remove(checkIn);
        await _context.SaveChangesAsync();

        backend.DTOs.Notification.NotificationResponse? createdNotification = null;
        if (deductedXp > 0)
        {
            createdNotification = await _notificationService.CreateXpDeductedNotificationAsync(
                removedUserId,
                deductedXp,
                "a check-in was deleted",
                DateTime.UtcNow);
        }

        await transaction.CommitAsync();
        if (createdNotification is not null)
        {
            await _notificationService.BroadcastCreatedNotificationsAsync(
                removedUserId,
                [createdNotification]);
        }
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
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var checkIn = await _context.CheckIns
            .Include(x => x.Trail)
            .FirstOrDefaultAsync(x => x.Id == checkInId);

        if (checkIn is null)
        {
            throw new KeyNotFoundException("Check-in not found");
        }

        if (checkIn.IsHidden)
        {
            return ToCheckInResponse(checkIn);
        }

        checkIn.IsHidden = true;
        var deductedXp = _xpCalculatorService.CalculateXp(
            checkIn.Trail.DistanceKm,
            checkIn.Trail.Difficulty);

        await _context.SaveChangesAsync();
        backend.DTOs.Notification.NotificationResponse? createdNotification = null;
        if (deductedXp > 0)
        {
            createdNotification = await _notificationService.CreateXpDeductedNotificationAsync(
                checkIn.UserId,
                deductedXp,
                "a check-in was hidden",
                DateTime.UtcNow);
        }
        await transaction.CommitAsync();
        if (createdNotification is not null)
        {
            await _notificationService.BroadcastCreatedNotificationsAsync(
                checkIn.UserId,
                [createdNotification]);
        }
        await _leaderboardNotificationService.BroadcastLeaderboardChangedAsync(checkIn.UserId);

        return ToCheckInResponse(checkIn);
    }

    public async Task<CheckInResponse> RestoreCheckInAsync(Guid checkInId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var checkIn = await _context.CheckIns
            .Include(x => x.Trail)
            .FirstOrDefaultAsync(x => x.Id == checkInId);

        if (checkIn is null)
        {
            throw new KeyNotFoundException("Check-in not found");
        }

        if (!checkIn.IsHidden)
        {
            return ToCheckInResponse(checkIn);
        }

        checkIn.IsHidden = false;
        var regainedXp = _xpCalculatorService.CalculateXp(
            checkIn.Trail.DistanceKm,
            checkIn.Trail.Difficulty);

        await _context.SaveChangesAsync();
        backend.DTOs.Notification.NotificationResponse? createdNotification = null;
        if (regainedXp > 0)
        {
            createdNotification = await _notificationService.CreateXpRegainedNotificationAsync(
                checkIn.UserId,
                regainedXp,
                DateTime.UtcNow);
        }
        await transaction.CommitAsync();
        if (createdNotification is not null)
        {
            await _notificationService.BroadcastCreatedNotificationsAsync(
                checkIn.UserId,
                [createdNotification]);
        }
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
