using FanDuelDepthChartEngine.Application.Interfaces;
using FanDuelDepthChartEngine.Domain.Validations;

namespace FanDuelDepthChartEngine.Infrastructure;

public sealed class InMemorySportPositionCatalogProvider : ISportPositionCatalogProvider
{
    private readonly Dictionary<string, SportPositionCatalog> _catalogs;

    public InMemorySportPositionCatalogProvider()
    {
        var catalogs = new[]
        {
            SportPositionCatalog.NFL,
            SportPositionCatalog.NBA,
            SportPositionCatalog.NHL,
            SportPositionCatalog.MLB,
        };
        _catalogs = catalogs.ToDictionary(c => c.SportId);
    }

    public SportPositionCatalog? GetCatalog(string sportId) =>
        _catalogs.TryGetValue(sportId.ToLowerInvariant(), out var c) ? c : null;
}