using backend.DTOs.Dashboard;

namespace backend.Services;

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardAsync(Guid userId);
}
