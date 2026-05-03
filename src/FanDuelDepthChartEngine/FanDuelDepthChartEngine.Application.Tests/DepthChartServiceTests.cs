
using FanDuelDepthChartEngine.Application.Interfaces;
using FanDuelDepthChartEngine.Application.Services;
using FanDuelDepthChartEngine.Domain.Models;
using FluentAssertions;
using Moq;

namespace FanDuelDepthChartEngine.Application.Tests;

public class DepthChartServiceTests
{
    private readonly Mock<IDepthChartRepository> _repoMock = new(MockBehavior.Strict);
    private readonly DepthChart _chart = new("nfl", "TB");
    private readonly DepthChartService _sut;

    public DepthChartServiceTests()
    {
        _repoMock
            .Setup(r => r.GetOrCreate("nfl", "TB"))
            .Returns(_chart);

        _sut = new DepthChartService(_repoMock.Object);
    }

    [Fact]
    public void AddPlayer_routes_through_repository_to_chart()
    {
        _sut.AddPlayer("nfl", "TB", "QB", new Player(12, "Brady"), 0);

        _repoMock.Verify(r => r.GetOrCreate("nfl", "TB"), Times.Once);
        _chart.GetFull()[PositionCode.Of("QB")].Should().HaveCount(1);
    }

    [Fact]
    public void RemovePlayer_returns_player_when_present()
    {
        _sut.AddPlayer("nfl", "TB", "QB", new Player(12, "Brady"), 0);

        var removed = _sut.RemovePlayer("nfl", "TB", "QB", 12);

        removed.Should().NotBeNull();
        removed!.Number.Should().Be(12);
    }

    [Fact]
    public void RemovePlayer_returns_null_when_absent()
    {
        _sut.RemovePlayer("nfl", "TB", "QB", 99).Should().BeNull();
    }

    [Fact]
    public void GetBackups_returns_players_below()
    {
        _sut.AddPlayer("nfl", "TB", "QB", new Player(12, "Brady"), 0);
        _sut.AddPlayer("nfl", "TB", "QB", new Player(11, "Gabbert"), 1);
        _sut.AddPlayer("nfl", "TB", "QB", new Player(2, "Trask"), 2);

        var backups = _sut.GetBackups("nfl", "TB", "QB", 12);

        backups.Should().HaveCount(2);
        backups.Select(p => p.Number).Should().Equal(11, 2);
    }

    [Fact]
    public void GetFull_returns_dictionary_keyed_by_position_string()
    {
        _sut.AddPlayer("nfl", "TB", "QB", new Player(12, "Brady"), 0);

        var full = _sut.GetFull("nfl", "TB");

        full.Should().ContainKey("QB");
        full["QB"].Should().HaveCount(1);
    }

    [Fact]
    public void Service_uses_the_chart_returned_by_the_repository_for_each_call()
    {
        // Each of the four operations should round-trip through GetOrCreate.
        _sut.AddPlayer("nfl", "TB", "QB", new Player(12, "Brady"), 0);
        _sut.RemovePlayer("nfl", "TB", "QB", 12);
        _sut.GetBackups("nfl", "TB", "QB", 12);
        _sut.GetFull("nfl", "TB");

        _repoMock.Verify(r => r.GetOrCreate("nfl", "TB"), Times.Exactly(4));
        _repoMock.VerifyNoOtherCalls();
    }
}
