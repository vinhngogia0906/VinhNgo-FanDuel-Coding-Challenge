
namespace FanDuelDepthChartEngine.Domain.Models;

public sealed record Player(int Number, string Name)
{
    public override string ToString() => $"#{Number} – {Name}";
}