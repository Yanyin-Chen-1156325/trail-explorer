using backend.DTOs.Auth;
using FluentValidation;

namespace backend.Validators;

public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .WithMessage("Refresh token is required")
            .MaximumLength(1024)
            .WithMessage("Refresh token must not exceed 1024 characters");
    }
}
