
namespace FanDuelDepthChartEngine.Domain.Models;

public sealed record PositionCode(string Value)
{
    public static PositionCode Of(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            throw new ArgumentException("Position code must be non-empty.", nameof(raw));
        return new PositionCode(raw.Trim().ToUpperInvariant());
    }

    public override string ToString() => Value;
}
