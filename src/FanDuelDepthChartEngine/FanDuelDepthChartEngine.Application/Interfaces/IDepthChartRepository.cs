
using FanDuelDepthChartEngine.Domain.Models;

namespace FanDuelDepthChartEngine.Application.Interfaces;

public interface IDepthChartRepository
{
    DepthChart GetOrCreate(string sportId, string teamId);
}
