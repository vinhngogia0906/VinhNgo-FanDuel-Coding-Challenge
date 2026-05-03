using FanDuelDepthChartEngine.Application.Interfaces;
using FanDuelDepthChartEngine.Domain.Models;
using System.Collections.Concurrent;

namespace FanDuelDepthChartEngine.Infrastructure.Repositories;

public sealed class InMemoryDepthChartRepository : IDepthChartRepository
{
    private readonly ConcurrentDictionary<(string sport, string team), DepthChart> _store = new();

    public DepthChart GetOrCreate(string sportId, string teamId) =>
        _store.GetOrAdd(
            (sportId.ToLowerInvariant(), teamId.ToUpperInvariant()),
            key => new DepthChart(key.sport, key.team));
}