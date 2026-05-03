using FanDuelDepthChartEngine.Domain.Models;
using FluentAssertions;

namespace FanDuelDepthChartEngine.Domain.Tests;

public class DepthChartSpecExampleTests
{
    private static readonly PositionCode QB = PositionCode.Of("QB");
    private static readonly PositionCode LWR = PositionCode.Of("LWR");

    private readonly Player _brady = new(12, "Tom Brady");
    private readonly Player _gabbert = new(11, "Blaine Gabbert");
    private readonly Player _trask = new(2, "Kyle Trask");
    private readonly Player _evans = new(13, "Mike Evans");
    private readonly Player _darden = new(1, "Jaelon Darden");
    private readonly Player _miller = new(10, "Scott Miller");

    private DepthChart Arrange()
    {
        var chart = new DepthChart("nfl", "TB");
        chart.AddPlayer(QB, _brady, 0);
        chart.AddPlayer(QB, _gabbert, 1);
        chart.AddPlayer(QB, _trask, 2);
        chart.AddPlayer(LWR, _evans, 0);
        chart.AddPlayer(LWR, _darden, 1);
        chart.AddPlayer(LWR, _miller, 2);
        return chart;
    }

    [Fact]
    public void GetBackups_for_starter_returns_everyone_below()
    {
        Arrange().GetBackups(QB, _brady.Number)
            .Should().Equal(_gabbert, _trask);
    }

    [Fact]
    public void GetBackups_for_middle_player_returns_only_those_below()
    {
        Arrange().GetBackups(QB, _gabbert.Number)
            .Should().Equal(_trask);
    }

    [Fact]
    public void GetBackups_for_last_player_returns_empty()
    {
        Arrange().GetBackups(QB, _trask.Number).Should().BeEmpty();
    }

    [Fact]
    public void GetBackups_for_player_not_at_position_returns_empty()
    {
        // Spec prose: "An empty list should be returned if the given player 
        // is not listed in the depth chart at that position."
        Arrange().GetBackups(QB, _evans.Number).Should().BeEmpty();
    }

    [Fact]
    public void RemovePlayer_returns_removed_player_and_compacts_chart()
    {
        var chart = Arrange();
        var removed = chart.RemovePlayer(LWR, _evans.Number);

        removed.Should().Be(_evans);
        chart.GetFull()[LWR].Should().Equal(_darden, _miller);
    }

    [Fact]
    public void RemovePlayer_for_unknown_player_returns_null()
    {
        Arrange().RemovePlayer(QB, 99).Should().BeNull();
    }

    [Fact]
    public void GetFull_returns_every_position_in_depth_order()
    {
        var full = Arrange().GetFull();

        full[QB].Should().Equal(_brady, _gabbert, _trask);
        full[LWR].Should().Equal(_evans, _darden, _miller);
    }
}
