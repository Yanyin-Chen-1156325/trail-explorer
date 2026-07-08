using backend.DTOs.CheckIn;
using FluentValidation;

namespace backend.Validators;

public class CreateCheckInRequestValidator : AbstractValidator<CreateCheckInRequest>
{
    public CreateCheckInRequestValidator()
    {
        RuleFor(x => x.TrailId)
            .NotEmpty()
            .WithMessage("Trail id is required");

        RuleFor(x => x.CompletedDate)
            .NotEmpty()
            .WithMessage("Completed date is required")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Completed date cannot be in the future");

        RuleFor(x => x.Notes)
            .MaximumLength(2000)
            .WithMessage("Notes must not exceed 2000 characters")
            .When(x => x.Notes is not null);

        RuleFor(x => x.PhotoUrl)
            .MaximumLength(2048)
            .WithMessage("Photo URL must not exceed 2048 characters")
            .When(x => x.PhotoUrl is not null);
    }
}
