namespace FanDuelDepthChartEngine.Domain.Validations;

public sealed class SportPositionCatalog
{
    public string SportId { get; }
    public IReadOnlySet<string> Codes { get; }

    public SportPositionCatalog(string sportId, IEnumerable<string> codes)
    {
        SportId = sportId.ToLowerInvariant();
        Codes = new HashSet<string>(
            codes.Select(c => c.Trim().ToUpperInvariant()),
            StringComparer.Ordinal);
    }

    public bool IsValid(string code) => Codes.Contains(code.Trim().ToUpperInvariant());

    public static SportPositionCatalog NFL { get; } = new("nfl", new[]
    {
        // Offense
        "QB", "RB", "FB",
        "LWR", "RWR", "SWR", "WR",
        "TE", "LT", "LG", "C", "RG", "RT",
        // Defense
        "LDE", "RDE", "DE", "DT", "NT",
        "LOLB", "ROLB", "MLB", "ILB", "LILB", "RILB", "OLB",
        "LCB", "RCB", "CB", "NB", "FS", "SS",
        // Special teams
        "PK", "K", "PT", "P", "LS", "H", "KO", "KR", "PR",
    });

    public static SportPositionCatalog NBA { get; } = new("nba", new[]
    {
        "PG", "SG", "SF", "PF", "C",
    });

    public static SportPositionCatalog NHL { get; } = new("nhl", new[]
    {
        "C", "LW", "RW", "LD", "RD", "G",
    });

    public static SportPositionCatalog MLB { get; } = new("mlb", new[]
    {
        "P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH",
    });
}
