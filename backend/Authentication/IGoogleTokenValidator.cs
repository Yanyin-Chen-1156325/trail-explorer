using Google.Apis.Auth;

namespace backend.Authentication;

public interface IGoogleTokenValidator
{
    Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken, string clientId);
}