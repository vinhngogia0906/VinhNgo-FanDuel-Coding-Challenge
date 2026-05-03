
using FanDuelDepthChartEngine.Application.Interfaces;
using FanDuelDepthChartEngine.Domain.Models;

namespace FanDuelDepthChartEngine.Application.Services;

public sealed class DepthChartService(IDepthChartRepository repository)
{
    public void AddPlayer(string sportId, string teamId, string position, Player player, int? depth)
        => repository.GetOrCreate(sportId, teamId)
                     .AddPlayer(PositionCode.Of(position), player, depth);

    public Player? RemovePlayer(string sportId, string teamId, string position, int playerNumber)
        => repository.GetOrCreate(sportId, teamId)
                     .RemovePlayer(PositionCode.Of(position), playerNumber);

    public IReadOnlyList<Player> GetBackups(string sportId, string teamId, string position, int playerNumber)
        => repository.GetOrCreate(sportId, teamId)
                     .GetBackups(PositionCode.Of(position), playerNumber);

    public IReadOnlyDictionary<string, IReadOnlyList<Player>> GetFull(string sportId, string teamId)
        => repository.GetOrCreate(sportId, teamId)
                     .GetFull()
                     .ToDictionary(kvp => kvp.Key.Value, kvp => kvp.Value);
}
