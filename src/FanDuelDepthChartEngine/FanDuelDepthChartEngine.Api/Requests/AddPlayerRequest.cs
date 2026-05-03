namespace FanDuelDepthChartEngine.Api.Requests;
public sealed record AddPlayerRequest(int Number, string Name, string Position, int? Depth);
