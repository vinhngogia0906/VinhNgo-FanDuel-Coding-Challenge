using FanDuelDepthChartEngine.Domain.Validations;

namespace FanDuelDepthChartEngine.Application.Interfaces;

public interface ISportPositionCatalogProvider
{
    SportPositionCatalog? GetCatalog(string sportId);
}
