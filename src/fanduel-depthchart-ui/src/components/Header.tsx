type HeaderProps = {
  team: string
  sport: string
}

export function Header({ team, sport }: HeaderProps) {
  return (
    <header className="app-header">
      <h1>FanDuel Depth Chart</h1>
      <div className="app-header__meta">
        <span aria-label={`Team ${team}, sport ${sport}`}>
          {team} / {sport}
        </span>
      </div>
    </header>
  )
}
