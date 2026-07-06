using backend.DTOs.Trail;
using FluentValidation;

namespace backend.Validators;

public class TrailQueryRequestValidator : AbstractValidator<TrailQueryRequest>
{
    public TrailQueryRequestValidator()
    {
        RuleFor(x => x.Search)
            .MaximumLength(100)
            .WithMessage("Search must not exceed 100 characters")
            .When(x => x.Search is not null);

        RuleFor(x => x.Difficulty)
            .IsInEnum()
            .WithMessage("Difficulty must be a valid trail difficulty")
            .When(x => x.Difficulty.HasValue);

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page number must be greater than or equal to 1");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100");
    }
}
