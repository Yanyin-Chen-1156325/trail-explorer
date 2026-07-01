using backend.DTOs.Auth;
using FluentValidation;

namespace backend.Validators;

public class GoogleOAuthRequestValidator : AbstractValidator<GoogleOAuthRequest>
{
    public GoogleOAuthRequestValidator()
    {
        RuleFor(x => x.IdToken)
            .NotEmpty()
            .WithMessage("Google ID token is required");
    }
}