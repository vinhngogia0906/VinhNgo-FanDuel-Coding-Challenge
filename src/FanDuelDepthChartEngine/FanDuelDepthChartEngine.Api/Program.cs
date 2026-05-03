using FanDuelDepthChartEngine.Api.Commands;
using FanDuelDepthChartEngine.Api.Requests;
using FanDuelDepthChartEngine.Api.Validation;
using FanDuelDepthChartEngine.Application.Interfaces;
using FanDuelDepthChartEngine.Application.Services;
using FanDuelDepthChartEngine.Domain.Models;
using FanDuelDepthChartEngine.Infrastructure;
using FanDuelDepthChartEngine.Infrastructure.Repositories;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// DI
builder.Services.AddSingleton<IDepthChartRepository, InMemoryDepthChartRepository>();
builder.Services.AddSingleton<ISportPositionCatalogProvider, InMemorySportPositionCatalogProvider>();
builder.Services.AddSingleton<DepthChartService>();
builder.Services.AddValidatorsFromAssemblyContaining<AddPlayerRequestValidator>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// CORS — the React dev server runs on 5173
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins("http://localhost:5173")
          .AllowAnyHeader()
          .AllowAnyMethod()));

// ProblemDetails for unhandled exceptions
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseExceptionHandler();
app.UseStatusCodePages();

var api = app.MapGroup("/api/sports/{sportId}/teams/{teamId}/depthchart")
             .WithTags("DepthChart");
// Map minimal Apis for the three operations specified in the prompt, plus one to get the full depth chart.
// health endpoint
app.MapGet("/health", () => Results.Ok(new { status = "ok" })).ExcludeFromDescription();
// addPlayerToDepthChart
api.MapPost("/", async (string sportId, string teamId, AddPlayerRequest req,
                        IValidator<AddPlayerCommand> validator,
                        DepthChartService svc) =>
{
    var command = new AddPlayerCommand(sportId, teamId, req);
    var result = await validator.ValidateAsync(command);
    if (!result.IsValid)
        return Results.ValidationProblem(result.ToDictionary());

    svc.AddPlayer(sportId, teamId, req.Position, new Player(req.Number, req.Name), req.Depth);
    return Results.NoContent();
})
.WithSummary("Add a player to the depth chart at a position. Validated against the sport's position catalog.");

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
