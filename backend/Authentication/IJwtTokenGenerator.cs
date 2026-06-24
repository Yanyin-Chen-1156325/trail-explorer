using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace backend.Authentication;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(Guid userId, string email, string role);

    string GenerateRefreshToken();

    DateTime GetAccessTokenExpiration();
}
