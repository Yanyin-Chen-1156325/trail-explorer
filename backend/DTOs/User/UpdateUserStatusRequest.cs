using backend.Enums;

namespace backend.DTOs.User;

public class UpdateUserStatusRequest
{
    public UserStatus Status { get; set; }
}
