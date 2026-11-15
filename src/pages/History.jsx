import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import { WarrantyBadge, ClientTypeBadge } from '../components/Badges.jsx'
import {
  CATS,
  clientContact,
  clientProduct,
  clientTitle,
  status,
} from '../services/domain.js'
import { fmt, TODAY } from '../services/dates.js'

export default function History({ onPrintClient }) {
  const { s, addWork } = useApp()
  const [cid, setCid] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [st, setSt] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const selectedClient = s.clients.find((x) => x.id === cid)

  const list = s.works.filter((w) => {
    if (cid && w.clientId !== cid) return false
    if (cat && w.category !== cat) return false
    if (st && status(w) !== st) return false
    if (from && w.date < from) return false
    if (to && w.date > to) return false
    if (q.trim()) {
      const c = s.clients.find((x) => x.id === w.clientId)
      const hay = [
        w.title,
        w.desc,
        w.notes,
        w.engineer,
        w.category,
        c ? clientTitle(c) : '',
        c ? clientContact(c) : '',
      ]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>🕘 Complete Work &amp; Service History ({list.length})</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            Search by client, filter by date &amp; category, and edit any previous record
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn s sm"
            onClick={() => addWork(TODAY(), cat || 'Servicing', cid)}
          >
            + Add Work Record
          </button>
          {onPrintClient && cid && (
            <button
              className="btn sm"
              onClick={() => onPrintClient(cid, cat || 'Sales')}
            >
              🖨 Print Client History
            </button>
          )}
        </div>
      </div>

      <div className="row">
        <input
          placeholder="Search client name, work title, engineer…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 220, flex: 1 }}
        />
        <select value={cid} onChange={(e) => setCid(e.target.value)} style={{ minWidth: 200 }}>
          <option value="">All clients ({s.clients.length})</option>
          {s.clients.map((x) => (
            <option key={x.id} value={x.id}>
              {clientTitle(x)} {clientContact(x) ? `— ${clientContact(x)}` : ''}
            </option>
          ))}
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {CATS.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="">All statuses</option>
          <option value="done">Completed</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="row">
        <label className="f" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ margin: 0 }}>From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="f" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ margin: 0 }}>To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        {(q || cid || cat || st || from || to) && (
          <button
            className="btn s sm"
            onClick={() => {
              setQ(''); setCid(''); setCat(''); setSt(''); setFrom(''); setTo('')
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {selectedClient && (
        <div className="warranty-preview" style={{ marginBottom: 14 }}>
          <div>
            <b>{clientTitle(selectedClient)}</b>{' '}
            <ClientTypeBadge c={selectedClient} />{' '}
            <span className="muted">
              · {clientProduct(selectedClient)} · SN {selectedClient.serial || '—'} · Sold/Start {fmt(selectedClient.saleDate)}
            </span>
          </div>
          <div>
            <WarrantyBadge c={selectedClient} />{' '}
            <span className="muted" style={{ marginLeft: 8 }}>
              Completed {list.filter((w) => w.status === 'done').length}/{list.length}
            </span>
          </div>
        </div>
      )}

      <WorkTable list={list} empty="No work history matches the selected filters." />
    </div>
  )
}
