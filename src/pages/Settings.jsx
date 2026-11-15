import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Field from '../components/Field.jsx'
import { seed, emptyState } from '../services/seed.js'
import { sync } from '../services/domain.js'

export default function Settings() {
  const { s, upd, setState } = useApp()
  const [company, setCompany] = useState(s.settings.company)
  const [engineers, setEngineers] = useState(s.settings.engineers)

  const exportJson = () => {
    const a = document.createElement('a')
    a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(s, null, 2))
    a.download = 'epi-ups-backup.json'
    a.click()
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h3>Settings</h3>
      <Field label="Company name (shown on reports)"><input value={company} onChange={(e) => setCompany(e.target.value)} /></Field>
      <br />
      <Field label="Engineers (comma separated)"><input value={engineers} onChange={(e) => setEngineers(e.target.value)} /></Field>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn" onClick={() => { upd((p) => ({ ...p, settings: { company, engineers } })); alert('Saved') }}>Save Settings</button>
      </div>
      <hr style={{ borderColor: 'var(--b)' }} />
      <h3>Data (localStorage)</h3>
      <div className="row">
        <button className="btn s" onClick={() => window.confirm('Replace all data with fresh demo data?') && setState(seed())}>Reload Demo Data</button>
        <button className="btn d" onClick={() => window.confirm('Clear ALL data (clients and works)?') && setState(sync({ ...emptyState(), settings: s.settings }))}>Clear Demo Data</button>
        <button className="btn s" onClick={exportJson}>Export JSON</button>
      </div>
      <p className="muted">Data is stored only in this browser. To use a real database, edit <code>src/services/storage.js</code>.</p>
    </div>
  )
}
