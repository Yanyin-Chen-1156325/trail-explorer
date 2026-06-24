namespace TrailExplorer.Models.Entities;

public enum UserRole
{
    User = 0,
    Moderator = 1,
    Admin = 2
}

public enum UserStatus
{
    Active = 0,
    Suspended = 1,
    Deleted = 2
}

public enum AuthProvider
{
    Email = 0,
    Google = 1
}

public enum TrailDifficulty
{
    Easy = 0,
    Intermediate = 1,
    Advanced = 2,
    Expert = 3
}
