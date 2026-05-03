import { useState, useEffect } from 'react'
import { type Player, getFullChart, toApiError } from './api/depthChart'
import { Header } from './components/Header'
import { DepthChartTable } from './components/DepthChartTable'
import { AddPlayerForm } from './components/AddPlayerForm'
import { BackupsLookup } from './components/BackupsLookup'
import { ToastRegion } from './components/Toast'
import { useToast } from './components/useToast'

export default function App() {
  const [chart, setChart] = useState<Record<string, Player[]>>({})
  const toast = useToast()

  const refresh = async () => {
    try {
      setChart(await getFullChart())
    } catch (e) {
      toast.error(toApiError(e).message)
    }
  }

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        const data = await getFullChart({ signal: ctrl.signal })
        setChart(data)
      } catch (e) {
        if (!ctrl.signal.aborted) toast.error(toApiError(e).message)
      }
    })()
    return () => ctrl.abort()
    // toast is a stable ref from useToast; intentional empty dep array for mount-only fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app">
      <Header team="TB" sport="NFL" />

      <section className="card" aria-labelledby="hdr-chart">
        <h2 id="hdr-chart">Depth chart</h2>
        <DepthChartTable
          chart={chart}
          onRemoved={name => { toast.success(`Removed ${name}`); void refresh() }}
          onError={msg => toast.error(msg)}
        />
      </section>

      <section className="card" aria-labelledby="hdr-add">
        <h2 id="hdr-add">Add player</h2>
        <AddPlayerForm
          onAdded={name => { toast.success(`Added ${name}`); void refresh() }}
          onError={msg => toast.error(msg)}
        />
      </section>

      <section className="card" aria-labelledby="hdr-backups">
        <h2 id="hdr-backups">Get backups</h2>
        <BackupsLookup chart={chart} onError={msg => toast.error(msg)} />
      </section>

      <ToastRegion toasts={toast.toasts} />
    </div>
  )
}
