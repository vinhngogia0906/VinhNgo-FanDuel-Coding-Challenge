import { useState, useEffect } from "react";
import { type Player, getFullChart, addPlayer, removePlayer, getBackups } from "./api/depthChart";

type Form = { position: string; number: string; name: string; depth: string };
type Lookup = { position: string; number: string };

const emptyForm: Form = { position: 'QB', number: '', name: '', depth: '' };
const emptyLookup: Lookup = { position: 'QB', number: '' };

export default function App() {
  const [chart, setChart] = useState<Record<string, Player[]>>({});
  const [form, setForm] = useState<Form>(emptyForm);
  const [lookup, setLookup] = useState<Lookup>(emptyLookup);
  const [backups, setBackups] = useState<Player[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try { setChart(await getFullChart()); }
    catch (e) { setError(String(e)); }
  };

  useEffect(() => { refresh(); }, []);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await addPlayer({
        position: form.position.trim(),
        number: Number(form.number),
        name: form.name.trim(),
        depth: form.depth === '' ? undefined : Number(form.depth),
      });
      setForm(emptyForm);
      await refresh();
    } catch (e) { setError(String(e)); }
  };

  const onRemove = async (position: string, number: number) => {
    setError(null);
    try { await removePlayer(position, number); await refresh(); }
    catch (e) { setError(String(e)); }
  };

  const onLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await getBackups(lookup.position.trim(), Number(lookup.number));
      setBackups(result);
    } catch (e) { setError(String(e)); }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 760 }}>
      <h1>FanDuel Depth Chart — TB (NFL)</h1>
      {error && <pre style={{ color: 'crimson' }}>{error}</pre>}

      <section>
        <h2>Add player</h2>
        <form onSubmit={onAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Position (e.g. QB)" value={form.position}
                 onChange={e => setForm({ ...form, position: e.target.value })} required />
          <input placeholder="Number" type="number" min={0} max={99}
                 value={form.number}
                 onChange={e => setForm({ ...form, number: e.target.value })} required />
          <input placeholder="Name" value={form.name}
                 onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Depth (blank = end)" type="number" min={0}
                 value={form.depth}
                 onChange={e => setForm({ ...form, depth: e.target.value })} />
          <button type="submit">Add</button>
        </form>
      </section>

      <section>
        <h2>Get backups</h2>
        <form onSubmit={onLookup} style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Position" value={lookup.position}
                 onChange={e => setLookup({ ...lookup, position: e.target.value })} required />
          <input placeholder="Number" type="number"
                 value={lookup.number}
                 onChange={e => setLookup({ ...lookup, number: e.target.value })} required />
          <button type="submit">Lookup</button>
        </form>
        {backups !== null && (
          <div style={{ marginTop: 8 }}>
            {backups.length === 0
              ? <em>&lt;NO LIST&gt;</em>
              : backups.map(p => <div key={p.number}>#{p.number} – {p.name}</div>)}
          </div>
        )}
      </section>

      <section>
        <h2>Full depth chart</h2>
        {Object.entries(chart).length === 0 && <em>(empty)</em>}
        {Object.entries(chart).map(([pos, players]) => (
          <div key={pos} style={{ marginBottom: 8 }}>
            <strong>{pos}</strong> –{' '}
            {players.map(p => (
              <span key={p.number} style={{ marginRight: 8 }}>
                (#{p.number}, {p.name})
                <button onClick={() => onRemove(pos, p.number)}
                        style={{ marginLeft: 4 }} aria-label={`Remove ${p.name}`}>✕</button>
              </span>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
