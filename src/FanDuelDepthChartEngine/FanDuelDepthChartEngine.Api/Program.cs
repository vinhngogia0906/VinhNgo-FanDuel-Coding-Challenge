using FanDuelDepthChartEngine.Api.Requests;
using FanDuelDepthChartEngine.Application.Interfaces;
using FanDuelDepthChartEngine.Application.Services;
using FanDuelDepthChartEngine.Domain.Models;
using FanDuelDepthChartEngine.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// DI
builder.Services.AddSingleton<IDepthChartRepository, InMemoryDepthChartRepository>();
builder.Services.AddSingleton<DepthChartService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// CORS — the React dev server runs on 5173
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins("http://localhost:5173")
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

var api = app.MapGroup("/api/sports/{sportId}/teams/{teamId}/depthchart")
             .WithTags("DepthChart");
// Map minimal Apis for the three operations specified in the prompt, plus one to get the full depth chart.
// addPlayerToDepthChart
api.MapPost("/", (string sportId, string teamId, AddPlayerRequest req, DepthChartService svc) =>
{
    svc.AddPlayer(sportId, teamId, req.Position, new Player(req.Number, req.Name), req.Depth);
    return Results.NoContent();
})
.WithSummary("Add a player to the depth chart at a position. " +
             "If depth is omitted, the player is appended to the end. " +
             "If supplied, players at and below that depth are shifted down.");

// removePlayerFromDepthChart
api.MapDelete("/{position}/{number:int}",
    (string sportId, string teamId, string position, int number, DepthChartService svc) =>
    {
        var removed = svc.RemovePlayer(sportId, teamId, position, number);
        return removed is null ? Results.NotFound() : Results.Ok(removed);
    })
.WithSummary("Remove a player from a position. Returns 404 if the player isn't at that position.");

// getBackups
api.MapGet("/{position}/{number:int}/backups",
    (string sportId, string teamId, string position, int number, DepthChartService svc) =>
        Results.Ok(svc.GetBackups(sportId, teamId, position, number)))
.WithSummary("Return all players ranked below the given player at the given position.");

// getFullDepthChart
api.MapGet("/", (string sportId, string teamId, DepthChartService svc) =>
        Results.Ok(svc.GetFull(sportId, teamId)))
.WithSummary("Return the full depth chart for a team.");

app.Run();
