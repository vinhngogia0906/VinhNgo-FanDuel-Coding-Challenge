import { useState } from 'react'
import type { FormEvent } from 'react'
import { addPlayer, toApiError } from '../api/depthChart'

type AddPlayerFormProps = {
  onAdded: (name: string) => void
  onError: (msg: string) => void
}

const empty = { position: 'QB', number: '', name: '', depth: '' }

export function AddPlayerForm({ onAdded, onError }: AddPlayerFormProps) {
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const position = form.position.trim().toUpperCase()
    const name     = form.name.trim()
    if (!position) { onError('Position is required.'); return }
    if (!name)     { onError('Name is required.');     return }

    setBusy(true)
    try {
      await addPlayer({
        position,
        number: Number(form.number),
        name,
        depth:  form.depth === '' ? undefined : Number(form.depth),
      })
      onAdded(name)
      setForm(empty)
    } catch (e) {
      const err = toApiError(e)
      const fields = Object.values(err.fieldErrors).flat().join(' ')
      onError(fields ? `${err.message} ${fields}` : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={submit} aria-label="Add player">
      <input
        className="input"
        placeholder="Position (e.g. QB)"
        value={form.position}
        onChange={e => setForm({ ...form, position: e.target.value.toUpperCase() })}
        autoCapitalize="characters"
        required
        aria-label="Position"
      />
      <input
        className="input input--num"
        placeholder="Number"
        type="number" min={0} max={99}
        value={form.number}
        onChange={e => setForm({ ...form, number: e.target.value })}
        required
        aria-label="Jersey number"
      />
      <input
        className="input"
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
        aria-label="Player name"
      />
      <input
        className="input input--num"
        placeholder="Depth"
        type="number" min={0}
        value={form.depth}
        onChange={e => setForm({ ...form, depth: e.target.value })}
        aria-label="Depth (optional)"
      />
      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? 'Adding…' : 'Add player'}
      </button>
    </form>
  )
}
