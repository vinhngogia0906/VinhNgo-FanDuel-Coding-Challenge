using FanDuelDepthChartEngine.Api.Commands;
using FanDuelDepthChartEngine.Application.Interfaces;
using FluentValidation;

namespace FanDuelDepthChartEngine.Api.Validation;

public sealed class AddPlayerRequestValidator : AbstractValidator<AddPlayerCommand>
{
    public AddPlayerRequestValidator(ISportPositionCatalogProvider catalogs)
    {
        RuleFor(x => x.SportId)
            .NotEmpty();

        RuleFor(x => x.TeamId)
            .NotEmpty()
            .MaximumLength(8);

        RuleFor(x => x.Request.Number)
            .InclusiveBetween(0, 99)
            .WithMessage("Jersey number must be between 0 and 99.");

        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Request.Position)
            .NotEmpty()
            .MaximumLength(8);

        RuleFor(x => x.Request.Depth)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Request.Depth.HasValue);

        // Cross-field: position must be valid for the sport.
        RuleFor(x => x).Custom((cmd, ctx) =>
        {
            if (string.IsNullOrWhiteSpace(cmd.SportId) || string.IsNullOrWhiteSpace(cmd.Request.Position))
                return;
            var catalog = catalogs.GetCatalog(cmd.SportId);
            if (catalog is null)
            {
                ctx.AddFailure(nameof(cmd.SportId), $"Unknown sport '{cmd.SportId}'.");
                return;
            }
            if (!catalog.IsValid(cmd.Request.Position))
                ctx.AddFailure("Request.Position",
                    $"Position '{cmd.Request.Position}' is not a valid {cmd.SportId.ToUpperInvariant()} position.");
        });
    }
}
