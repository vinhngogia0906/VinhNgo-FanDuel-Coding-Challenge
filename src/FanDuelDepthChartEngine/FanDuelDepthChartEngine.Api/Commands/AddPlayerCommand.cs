using FanDuelDepthChartEngine.Api.Requests;

namespace FanDuelDepthChartEngine.Api.Commands;

// Wrapper so the validator can see route values together with the body.
public sealed record AddPlayerCommand(string SportId, string TeamId, AddPlayerRequest Request);
