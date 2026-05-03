
namespace FanDuelDepthChartEngine.Domain.Models;

public sealed class DepthChart
{
    private readonly Dictionary<PositionCode, List<Player>> _byPosition = new();

    public string SportId { get; }
    public string TeamId { get; }

    public DepthChart(string sportId, string teamId)
    {
        SportId = sportId ?? throw new ArgumentNullException(nameof(sportId));
        TeamId = teamId ?? throw new ArgumentNullException(nameof(teamId));
    }

    /// <summary>
    /// Adds a player to the depth chart at <paramref name="position"/>.
    /// If <paramref name="depth"/> is null, appends to the end of the position's roster.
    /// If supplied, players at and below that depth are shifted down by one.
    /// Adding a player that already exists at the same position is a no-op.
    /// </summary>
    public void AddPlayer(PositionCode position, Player player, int? depth = null)
    {
        ArgumentNullException.ThrowIfNull(position);
        ArgumentNullException.ThrowIfNull(player);

        if (!_byPosition.TryGetValue(position, out var roster))
            _byPosition[position] = roster = new List<Player>();

        // Per spec: jersey number uniquely identifies a player. Idempotent re-add.
        if (roster.Any(p => p.Number == player.Number)) return;

        if (depth is null || depth >= roster.Count)
            roster.Add(player);
        else
            roster.Insert(Math.Max(0, depth.Value), player);
    }

    /// <summary>
    /// Removes a player from <paramref name="position"/> and returns them.
    /// Returns null if the player is not at that position.
    /// </summary>
    public Player? RemovePlayer(PositionCode position, int playerNumber)
    {
        if (!_byPosition.TryGetValue(position, out var roster)) return null;
        var idx = roster.FindIndex(p => p.Number == playerNumber);
        if (idx < 0) return null;
        var removed = roster[idx];
        roster.RemoveAt(idx);
        return removed;
    }

    /// <summary>
    /// Returns players ranked below the given player at <paramref name="position"/>.
    /// Empty if the player is not at that position or has no backups.
    /// </summary>
    public IReadOnlyList<Player> GetBackups(PositionCode position, int playerNumber)
    {
        if (!_byPosition.TryGetValue(position, out var roster)) return Array.Empty<Player>();
        var idx = roster.FindIndex(p => p.Number == playerNumber);
        if (idx < 0 || idx >= roster.Count - 1) return Array.Empty<Player>();
        return roster.Skip(idx + 1).ToList();
    }

    /// <summary>Returns the full depth chart, ordered by position.</summary>
    public IReadOnlyDictionary<PositionCode, IReadOnlyList<Player>> GetFull() =>
        _byPosition.ToDictionary(
            kvp => kvp.Key,
            kvp => (IReadOnlyList<Player>)kvp.Value.AsReadOnly());
}
