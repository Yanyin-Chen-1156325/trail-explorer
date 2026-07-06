namespace backend.DTOs.Auth;

public class GoogleOAuthRequest
{
    public string IdToken { get; set; } = string.Empty;

    public bool CreateAccount { get; set; }
}
