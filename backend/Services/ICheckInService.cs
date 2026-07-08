using backend.DTOs.CheckIn;

namespace backend.Services;

public interface ICheckInService
{
    Task<CheckInResponse> CreateCheckInAsync(Guid userId, CreateCheckInRequest request);

    Task<CheckInResponse> UpdateCheckInAsync(Guid checkInId, Guid userId, UpdateCheckInRequest request);

    Task DeleteCheckInAsync(Guid checkInId, Guid userId);

    Task<IReadOnlyList<CheckInResponse>> GetUserCheckInHistoryAsync(Guid userId);

    Task<IReadOnlyList<CheckInResponse>> GetAllCheckInsAsync();

    Task<CheckInResponse> HideCheckInAsync(Guid checkInId);

    Task<CheckInResponse> RestoreCheckInAsync(Guid checkInId);
}
