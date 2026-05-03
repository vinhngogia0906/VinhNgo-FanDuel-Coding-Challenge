import { useState } from 'react'
import type { FormEvent } from 'react'
import { type Player, getBackups, toApiError } from '../api/depthChart'

type BackupsLookupProps = {
  chart: Record<string, Player[]>
  onError: (msg: string) => void
}

const empty = { position: 'QB', number: '' }

export function BackupsLookup({ chart, onError }: BackupsLookupProps) {
  const [lookup, setLookup]       = useState(empty)
  const [result, setResult]       = useState<Player[] | null>(null)
  const [submitted, setSubmitted] = useState<typeof empty | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const position = lookup.position.trim().toUpperCase()
    if (!position) { onError('Position is required.'); return }
    try {
      const data = await getBackups(position, Number(lookup.number))
      setResult(data)
      setSubmitted({ position, number: lookup.number })
    } catch (e) {
      onError(toApiError(e).message)
    }
  }

  const lookedUpName = submitted
    ? chart[submitted.position]?.find(p => p.number === Number(submitted.number))?.name
    : undefined

  return (
    <>
      <form className="form" onSubmit={submit} aria-label="Look up backups">
        <input
          className="input"
          placeholder="Position"
          value={lookup.position}
          onChange={e => setLookup({ ...lookup, position: e.target.value.toUpperCase() })}
          autoCapitalize="characters"
          required
          aria-label="Position"
        />
        <input
          className="input input--num"
          placeholder="Number"
          type="number" min={0} max={99}
          value={lookup.number}
          onChange={e => setLookup({ ...lookup, number: e.target.value })}
          required
          aria-label="Jersey number"
        />
        <button type="submit" className="btn btn--primary">Lookup</button>
      </form>

      {result !== null && submitted && (
        <div role="status" aria-live="polite">
          {result.length === 0 ? (
            <p className="empty">
              No backups for {submitted.position} #{submitted.number}
              {lookedUpName ? ` (${lookedUpName})` : ''}.
            </p>
          ) : (
            <ol className="backups-list">
              {result.map(p => (
                <li key={p.number}>
                  <span className="chip">
                    <span className="chip__num">#{p.number}</span>
                    <span>{p.name}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  )
}
