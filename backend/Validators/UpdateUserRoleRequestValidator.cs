using backend.DTOs.User;
using FluentValidation;

namespace backend.Validators;

public class UpdateUserRoleRequestValidator : AbstractValidator<UpdateUserRoleRequest>
{
    public UpdateUserRoleRequestValidator()
    {
        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Role must be a valid user role");
    }
}