using Google.Apis.Auth;

namespace backend.Authentication;

public class GoogleTokenValidator : IGoogleTokenValidator
{
    public Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken, string clientId)
    {
        return GoogleJsonWebSignature.ValidateAsync(
            idToken,
            new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [clientId]
            });
    }
}