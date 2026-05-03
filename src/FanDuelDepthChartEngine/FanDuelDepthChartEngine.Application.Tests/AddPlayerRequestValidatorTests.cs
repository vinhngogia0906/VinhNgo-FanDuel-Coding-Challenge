using FanDuelDepthChartEngine.Api.Commands;
using FanDuelDepthChartEngine.Api.Requests;
using FanDuelDepthChartEngine.Api.Validation;
using FanDuelDepthChartEngine.Infrastructure;
using FluentAssertions;

namespace FanDuelDepthChartEngine.Application.Tests;

public class AddPlayerRequestValidatorTests
{
    private readonly AddPlayerRequestValidator _validator =
        new(new InMemorySportPositionCatalogProvider());

    private static AddPlayerCommand Cmd(
        string sport = "nfl", string team = "TB",
        int number = 12, string name = "Tom Brady",
        string position = "QB", int? depth = 0) =>
        new(sport, team, new AddPlayerRequest(number, name, position, depth));

    [Fact]
    public async Task Valid_request_passes()
        => (await _validator.ValidateAsync(Cmd())).IsValid.Should().BeTrue();

    [Theory]
    [InlineData(-1)]
    [InlineData(100)]
    public async Task Invalid_jersey_number_fails(int n)
        => (await _validator.ValidateAsync(Cmd(number: n))).IsValid.Should().BeFalse();

    [Fact]
    public async Task Empty_name_fails()
        => (await _validator.ValidateAsync(Cmd(name: ""))).IsValid.Should().BeFalse();

    [Fact]
    public async Task Negative_depth_fails()
        => (await _validator.ValidateAsync(Cmd(depth: -1))).IsValid.Should().BeFalse();

    [Fact]
    public async Task Unknown_sport_fails()
        => (await _validator.ValidateAsync(Cmd(sport: "cricket"))).IsValid.Should().BeFalse();

    [Fact]
    public async Task NFL_position_on_NBA_request_fails()
    {
        var result = await _validator.ValidateAsync(Cmd(sport: "nba", position: "QB"));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Request.Position");
    }

    [Fact]
    public async Task NBA_position_on_NBA_request_passes()
        => (await _validator.ValidateAsync(Cmd(sport: "nba", position: "SF"))).IsValid.Should().BeTrue();
}