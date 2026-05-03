import { type Player, removePlayer, toApiError } from '../api/depthChart'

type DepthChartTableProps = {
  chart: Record<string, Player[]>
  onRemoved: (name: string) => void
  onError: (msg: string) => void
}

export function DepthChartTable({ chart, onRemoved, onError }: DepthChartTableProps) {
  // Filter out positions whose rosters have been emptied — the backend keeps
  // the key even when the last player is removed, but rendering an empty row
  // would be visually confusing (and trips up E2E assertions).
  const positions = Object.keys(chart)
    .filter(p => chart[p].length > 0)
    .sort()

  const remove = async (position: string, p: Player) => {
    try {
      await removePlayer(position, p.number)
      onRemoved(p.name)
    } catch (e) {
      onError(toApiError(e).message)
    }
  }

  if (positions.length === 0) {
    return (
      <p className="empty">
        No players yet — add your first via the form below.
      </p>
    )
  }

  return (
    <div className="chart-wrap">
      <table className="chart">
        <caption className="visually-hidden">Depth chart by position</caption>
        <thead>
          <tr>
            <th scope="col">Pos</th>
            <th scope="col">Players (depth ascending)</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos}>
              <td className="pos">{pos}</td>
              <td>
                {chart[pos].map(p => (
                  <span key={p.number} className="chip">
                    <span className="chip__num">#{p.number}</span>
                    <span>{p.name}</span>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => remove(pos, p)}
                      aria-label={`Remove ${p.name} from ${pos}`}
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
