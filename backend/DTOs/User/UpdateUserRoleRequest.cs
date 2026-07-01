using backend.Enums;

namespace backend.DTOs.User;

public class UpdateUserRoleRequest
{
    public UserRole Role { get; set; }
}