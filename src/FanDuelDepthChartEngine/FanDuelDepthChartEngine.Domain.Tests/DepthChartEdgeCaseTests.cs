using FanDuelDepthChartEngine.Domain.Models;
using FluentAssertions;

namespace FanDuelDepthChartEngine.Domain.Tests;

public class DepthChartEdgeCaseTests
{
    private static readonly PositionCode QB = PositionCode.Of("QB");
    private static readonly PositionCode LT = PositionCode.Of("LT");
    private static readonly PositionCode RT = PositionCode.Of("RT");

    private readonly DepthChart _chart = new("nfl", "TB");

    [Fact]
    public void AddPlayer_without_depth_appends_to_end()
    {
        _chart.AddPlayer(QB, new(12, "Brady"));
        _chart.AddPlayer(QB, new(11, "Gabbert"));

        _chart.GetFull()[QB].Select(p => p.Number).Should().Equal(12, 11);
    }

    [Fact]
    public void AddPlayer_at_occupied_depth_shifts_existing_players_down()
    {
        _chart.AddPlayer(QB, new(11, "Gabbert"), 0);
        _chart.AddPlayer(QB, new(12, "Brady"), 0); // Brady takes #1, Gabbert moves to #2

        _chart.GetFull()[QB].Select(p => p.Number).Should().Equal(12, 11);
    }

    [Fact]
    public void AddPlayer_at_depth_beyond_end_is_clamped_to_append()
    {
        _chart.AddPlayer(QB, new(12, "Brady"), 99);

        _chart.GetFull()[QB].Should().HaveCount(1);
        _chart.GetFull()[QB][0].Number.Should().Be(12);
    }

    [Fact]
    public void Adding_same_jersey_number_at_same_position_is_idempotent()
    {
        _chart.AddPlayer(QB, new(12, "Brady"), 0);
        _chart.AddPlayer(QB, new(12, "Brady"), 0);

        _chart.GetFull()[QB].Should().HaveCount(1);
    }

    [Fact]
    public void Same_player_can_appear_at_multiple_positions()
    {
        var wells = new Player(78, "Josh Wells");
        _chart.AddPlayer(LT, wells, 1);
        _chart.AddPlayer(RT, wells, 1);

        _chart.GetFull()[LT].Should().Contain(wells);
        _chart.GetFull()[RT].Should().Contain(wells);
    }

    [Fact]
    public void GetBackups_for_unknown_position_returns_empty()
    {
        _chart.GetBackups(PositionCode.Of("ZZZ"), 12).Should().BeEmpty();
    }

    [Fact]
    public void RemovePlayer_from_unknown_position_returns_null()
    {
        _chart.RemovePlayer(PositionCode.Of("ZZZ"), 12).Should().BeNull();
    }

    [Theory]
    [InlineData("qb")]
    [InlineData("Qb")]
    [InlineData(" QB ")]
    public void PositionCode_normalises_case_and_whitespace(string raw)
    {
        var normalised = PositionCode.Of(raw);
        normalised.Value.Should().Be("QB");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void PositionCode_rejects_empty_or_null(string? raw)
    {
        Action act = () => PositionCode.Of(raw!);
        act.Should().Throw<ArgumentException>();
    }
}