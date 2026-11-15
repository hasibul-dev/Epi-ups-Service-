import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { WarrantyBadge } from '../components/Badges.jsx'
import WorkTable from '../components/WorkTable.jsx'
import {
  clientContact,
  clientProduct,
  clientTitle,
  clientType,
  warr,
} from '../services/domain.js'
import { fmt, TODAY } from '../services/dates.js'

export default function Clients({ category = 'Sales', onPrintClient }) {
  const { s, upd, addClient, editClient, addWork } = useApp()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState('')

  const categoryClients = s.clients.filter((c) => clientType(c) === category)
  const list = categoryClients.filter((c) => {
    const hay = [
      clientTitle(c),
      clientContact(c),
      c.phone,
      c.email,
      c.address,
      clientProduct(c),
      c.productType,
      c.model,
      c.serial,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const w = warr(c)
    return (
      hay.includes(q.toLowerCase()) &&
      (filter === 'all' || (filter === 'active') === w.active)
    )
  })

  const remove = (c) => {
    if (!window.confirm(`Delete ${clientTitle(c)} and all their works?`)) return
    if (selectedId === c.id) setSelectedId('')
    upd((p) => ({
      ...p,
      clients: p.clients.filter((x) => x.id !== c.id),
      works: p.works.filter((w) => w.clientId !== c.id),
    }))
  }

  const clientIds = new Set(categoryClients.map((c) => c.id))
  const sectionWorks = s.works.filter(
    (w) => clientIds.has(w.clientId) || w.category === category
  )

  const selectedClient = s.clients.find((c) => c.id === selectedId)
  const selectedWorks = selectedClient
    ? s.works.filter((w) => w.clientId === selectedClient.id)
    : []

  const workCountFor = (id) => s.works.filter((w) => w.clientId === id).length

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
            <input
              placeholder={`Search ${category.toLowerCase()} clients by name, phone, model, serial…`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ minWidth: 240, flex: 1 }}
            />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All warranty ({categoryClients.length})</option>
              <option value="active">Active warranty</option>
              <option value="expired">Expired warranty</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn s"
              onClick={() => addWork(TODAY(), category)}
            >
              + Add {category} Work
            </button>
            <button
              className="btn btn-primary-highlight"
              onClick={() => addClient(category)}
            >
              + Add {category} Client
            </button>
          </div>
        </div>

        {list.length ? (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Client / Contact</th>
                  <th>Phone / Email</th>
                  <th>Product / Model</th>
                  <th>Serial / Qty</th>
                  <th>{category === 'Sales' ? 'Sale Date' : 'Start Date'}</th>
                  <th>Warranty</th>
                  <th>Expiry</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const w = warr(c)
                  const wc = workCountFor(c.id)
                  const isSel = selectedId === c.id
                  return (
                    <tr key={c.id} className={isSel ? 'row-selected' : ''}>
                      <td>
                        <b>{clientTitle(c)}</b>
                        {clientContact(c) && (
                          <div className="muted">{clientContact(c)}</div>
                        )}
                        {c.address && (
                          <div className="muted" style={{ fontSize: 12 }}>
                            {c.address}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{c.phone || '—'}</div>
                        {c.email && (
                          <div className="muted" style={{ fontSize: 12 }}>
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{clientProduct(c)}</div>
                        {c.productType && (
                          <span className="bd b" style={{ marginTop: 4, display: 'inline-block' }}>
                            {c.productType}
                          </span>
                        )}
                      </td>
                      <td>
                        <div>{c.serial || '—'}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          Qty: {c.quantity || 1}
                        </div>
                      </td>
                      <td>{fmt(c.saleDate)}</td>
                      <td>
                        <WarrantyBadge c={c} />
                        <div className="muted" style={{ fontSize: 12 }}>
                          {w.months} months
                        </div>
                      </td>
                      <td>{fmt(w.exp)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className={'btn sm ' + (isSel ? '' : 's')}
                          onClick={() => setSelectedId(isSel ? '' : c.id)}
                          title="View client details & work history"
                        >
                          History ({wc})
                        </button>{' '}
                        {onPrintClient && (
                          <>
                            <button
                              className="btn s sm"
                              onClick={() => onPrintClient(c.id, category)}
                              title="Open printable client report"
                            >
                              🖨
                            </button>{' '}
                          </>
                        )}
                        <button className="btn s sm" onClick={() => editClient(c)}>
                          Edit
                        </button>{' '}
                        <button className="btn d sm" onClick={() => remove(c)}>
                          Del
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            No {category.toLowerCase()} clients found. Click "+ Add {category} Client" to register one.
          </div>
        )}
      </div>

      {selectedClient && (
        <div className="card client-detail-panel">
          <div className="card-header-bar">
            <div>
              <h3 className="card-title">
                📋 {clientTitle(selectedClient)} — Client Details &amp; Complete History
              </h3>
              <span className="card-subtitle">
                {clientContact(selectedClient) ? `${clientContact(selectedClient)} · ` : ''}
                {selectedClient.phone || 'No phone'} · {selectedClient.email || 'No email'} ·{' '}
                {clientProduct(selectedClient)} (Qty: {selectedClient.quantity || 1}, SN: {selectedClient.serial || '—'}) ·{' '}
                <WarrantyBadge c={selectedClient} />
              </span>
            </div>
            <div className="card-actions">
              <button
                className="btn sm"
                onClick={() => addWork(TODAY(), category, selectedClient.id)}
              >
                + Add Work for Client
              </button>
              {onPrintClient && (
                <button
                  className="btn s sm"
                  onClick={() => onPrintClient(selectedClient.id, category)}
                >
                  🖨 Print Client Report
                </button>
              )}
              <button className="btn s sm" onClick={() => setSelectedId('')}>
                Close
              </button>
            </div>
          </div>
          <WorkTable
            list={selectedWorks}
            empty="No work records for this client yet."
          />
        </div>
      )}

      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">
              {category === 'Sales'
                ? '💼 Sales Work & Maintenance Schedule'
                : category === 'Servicing'
                ? '🛠️ Servicing Work Records & History'
                : '⚙️ Maintenance Work Records & History'}
              {' '}({sectionWorks.length})
            </h3>
            <span className="card-subtitle">
              All work orders, scheduled reminders, and service history for {category} clients
            </span>
          </div>
          <button className="btn s sm" onClick={() => addWork(TODAY(), category)}>
            + Add {category} Work
          </button>
        </div>
        <WorkTable
          list={sectionWorks}
          empty={`No ${category.toLowerCase()} work records yet.`}
        />
      </div>
    </>
  )
}
