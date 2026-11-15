import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useApp } from '../context/AppContext.jsx'
import {
  CATS,
  byTime,
  clientContact,
  clientProduct,
  clientTitle,
  clientType,
  status,
  warr,
} from '../services/domain.js'
import { TODAY, addD, fmt } from '../services/dates.js'

const REPORT_TYPES = [
  {
    id: 'sales',
    title: 'Sales Client Report',
    icon: '💼',
    category: 'Sales',
    desc: 'Sales clients, products, warranty tracking & sales work records',
  },
  {
    id: 'servicing',
    title: 'Servicing Report',
    icon: '🛠️',
    category: 'Servicing',
    desc: 'Servicing tasks, site repairs & client service notes',
  },
  {
    id: 'maintenance',
    title: 'Maintenance Report',
    icon: '⚙️',
    category: 'Maintenance',
    desc: 'Automatic 3-month & manual maintenance schedules',
  },
  {
    id: 'general',
    title: 'General Work Report',
    icon: '📋',
    category: 'General',
    desc: 'General inspections, internal tasks & miscellaneous works',
  },
  {
    id: 'schedule',
    title: 'Schedule Report',
    icon: '🗓️',
    category: '',
    desc: 'Complete scheduled, pending, overdue & completed work timeline',
  },
]

export default function Report({ preselectClientId = '', preselectReport = '' }) {
  const { s, editWork } = useApp()

  const [selectedReports, setSelectedReports] = useState(() =>
    preselectReport ? [preselectReport] : ['sales', 'servicing', 'maintenance', 'general', 'schedule']
  )
  const [from, setFrom] = useState(addD(TODAY(), -90))
  const [to, setTo] = useState(addD(TODAY(), 90))
  const [workType, setWorkType] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [q, setQ] = useState('')
  const [selectedClientIds, setSelectedClientIds] = useState(() =>
    preselectClientId ? [preselectClientId] : []
  )
  const [previewMode, setPreviewMode] = useState(false)
  const [soloPrintId, setSoloPrintId] = useState('')

  useEffect(() => {
    if (preselectReport) setSelectedReports([preselectReport])
    if (preselectClientId) setSelectedClientIds([preselectClientId])
  }, [preselectClientId, preselectReport])

  const toggleReport = (id) =>
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const selectAllReports = () => setSelectedReports(REPORT_TYPES.map((r) => r.id))
  const deselectAllReports = () => setSelectedReports([])

  const matchingClients = s.clients.filter((c) => {
    if (!q.trim()) return true
    const hay = [
      clientTitle(c),
      clientContact(c),
      c.phone,
      c.email,
      clientProduct(c),
      c.serial,
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })

  const toggleClient = (id) =>
    setSelectedClientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const activeClientIds =
    selectedClientIds.length > 0
      ? selectedClientIds
      : q.trim()
      ? matchingClients.map((c) => c.id)
      : null

  // Compute filtered work rows for a given report type
  const getReportData = (reportId) => {
    const def = REPORT_TYPES.find((r) => r.id === reportId) || REPORT_TYPES[4]
    const rows = s.works
      .filter((w) => {
        if (from && w.date < from) return false
        if (to && w.date > to) return false
        if (workType && w.category !== workType) return false
        if (statusFilter && status(w) !== statusFilter) return false
        if (activeClientIds && !activeClientIds.includes(w.clientId)) return false

        if (def.category) {
          if (reportId === 'sales') {
            const c = s.clients.find((x) => x.id === w.clientId)
            if (w.category !== 'Sales' && (!c || clientType(c) !== 'Sales')) return false
          } else if (w.category !== def.category) {
            return false
          }
        }
        return true
      })
      .sort(byTime)

    const clientsForSheet =
      reportId === 'sales'
        ? matchingClients.filter(
            (c) =>
              clientType(c) === 'Sales' &&
              (selectedClientIds.length === 0 || selectedClientIds.includes(c.id))
          )
        : selectedClientIds.length > 0
        ? s.clients.filter((c) => selectedClientIds.includes(c.id))
        : []

    return { def, rows, clientsForSheet }
  }

  const runPrint = (filenameLabel, soloId = '') => {
    const prevTitle = document.title
    document.title = filenameLabel
    if (soloId) {
      flushSync(() => setSoloPrintId(soloId))
    }
    window.print()
    setSoloPrintId('')
    setTimeout(() => {
      document.title = prevTitle
    }, 300)
  }

  const printSelected = () =>
    runPrint(`EPI-UPS-Selected-Reports-${TODAY()}`)

  const exportSelectedPdf = () =>
    runPrint(`EPI-UPS-Reports-${TODAY()}`)

  const printIndividual = (reportId, title) =>
    runPrint(`EPI-UPS-${title.replace(/\s+/g, '-')}-${TODAY()}`, reportId)

  const cname = (id) => {
    const c = s.clients.find((x) => x.id === id)
    return c ? clientTitle(c) : 'Internal / General'
  }
  const statusLabel = (w) =>
    ({ done: 'Completed', overdue: 'Overdue', pending: 'Pending' }[status(w)])

  const activeSheets = REPORT_TYPES.filter((r) => selectedReports.includes(r.id))

  return (
    <>
      {/* Preview Mode Sticky Action Bar */}
      {previewMode && (
        <div className="card no-print preview-bar">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 0 }}>
            <div>
              <b>👁 Print Preview Mode</b>
              <span className="muted" style={{ marginLeft: 10, fontSize: 12 }}>
                Showing {activeSheets.length} selected report{activeSheets.length === 1 ? '' : 's'} formatted for A4
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn s" onClick={() => setPreviewMode(false)}>
                ← Back to Filters
              </button>
              <button
                className="btn"
                disabled={!activeSheets.length}
                onClick={printSelected}
              >
                🖨 Print Selected ({activeSheets.length})
              </button>
              <button
                className="btn btn-primary-highlight"
                disabled={!activeSheets.length}
                onClick={exportSelectedPdf}
              >
                ⬇ Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Builder & Filter Controls */}
      {!previewMode && (
        <div className="card no-print">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0 }}>📄 Schedule &amp; Work Reports Center</h3>
              <span className="muted" style={{ fontSize: 12 }}>
                Select one or multiple reports, apply filters, preview A4 layout, print or export PDF
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn s"
                disabled={!activeSheets.length}
                onClick={() => setPreviewMode(true)}
              >
                👁 Print Preview
              </button>
              <button
                className="btn"
                disabled={!activeSheets.length}
                onClick={printSelected}
              >
                🖨 Print Selected ({activeSheets.length})
              </button>
              <button
                className="btn btn-primary-highlight"
                disabled={!activeSheets.length}
                onClick={exportSelectedPdf}
              >
                ⬇ Export PDF
              </button>
            </div>
          </div>

          {/* Step 1: Report Type Multi-Selection */}
          <div className="report-select-section">
            <div className="report-picker-head">
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                1. Select Report Types ({activeSheets.length} of {REPORT_TYPES.length} selected)
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="btn s sm" onClick={selectAllReports}>
                  ☑ Select All
                </button>
                <button type="button" className="btn s sm" onClick={deselectAllReports}>
                  ☐ Deselect All
                </button>
              </div>
            </div>

            <div className="report-type-grid">
              {REPORT_TYPES.map((rt) => {
                const checked = selectedReports.includes(rt.id)
                const { rows, clientsForSheet } = getReportData(rt.id)
                const itemCount = rt.id === 'sales' ? clientsForSheet.length + rows.length : rows.length
                return (
                  <div
                    key={rt.id}
                    className={'report-type-card' + (checked ? ' selected' : '')}
                    onClick={() => toggleReport(rt.id)}
                    role="checkbox"
                    aria-checked={checked}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleReport(rt.id)
                      }
                    }}
                  >
                    <div className="rt-top">
                      <span className="rt-check">{checked ? '☑' : '☐'}</span>
                      <span className="rt-icon">{rt.icon}</span>
                      <span className="rt-title">{rt.title}</span>
                    </div>
                    <div className="rt-desc">{rt.desc}</div>
                    <div className="rt-footer">
                      <span className="bd b">{itemCount} record{itemCount === 1 ? '' : 's'}</span>
                      <button
                        type="button"
                        className="btn s sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          printIndividual(rt.id, rt.title)
                        }}
                        title={`Print only ${rt.title}`}
                      >
                        🖨 Print Only
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step 2: Date, Client, Work Type & Status Filters */}
          <div className="report-filters-box">
            <div className="report-picker-head" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>2. Filter Report Data</span>
              {(q || selectedClientIds.length > 0 || workType || statusFilter) && (
                <button
                  type="button"
                  className="btn s sm"
                  onClick={() => {
                    setQ('')
                    setSelectedClientIds([])
                    setWorkType('')
                    setStatusFilter('')
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="row">
              <label className="f" style={{ flex: 1, minWidth: 200 }}>
                <span>Search Client</span>
                <input
                  placeholder="Search client or company name…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>
              <label className="f">
                <span>From Date</span>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="f">
                <span>To Date</span>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              <label className="f">
                <span>Work Type</span>
                <select value={workType} onChange={(e) => setWorkType(e.target.value)}>
                  <option value="">All Work Types</option>
                  {CATS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="f">
                <span>Status</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="done">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </label>
            </div>

            {/* Client Multi-Select */}
            <div className="report-client-picker">
              <div className="report-picker-head">
                <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
                  Client Filter ({selectedClientIds.length ? `${selectedClientIds.length} selected` : 'All matching clients'}):
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn s sm"
                    onClick={() => setSelectedClientIds(matchingClients.map((c) => c.id))}
                  >
                    Select All Clients ({matchingClients.length})
                  </button>
                  {selectedClientIds.length > 0 && (
                    <button
                      type="button"
                      className="btn s sm"
                      onClick={() => setSelectedClientIds([])}
                    >
                      Clear Clients
                    </button>
                  )}
                </div>
              </div>
              <div className="client-chip-list">
                {matchingClients.map((c) => {
                  const checked = selectedClientIds.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={'client-chip' + (checked ? ' active' : '')}
                      onClick={() => toggleClient(c.id)}
                    >
                      <span>{checked ? '☑' : '☐'}</span>
                      <span>{clientTitle(c)}</span>
                      <small className="muted">({clientType(c)})</small>
                    </button>
                  )
                })}
                {!matchingClients.length && (
                  <span className="muted" style={{ fontSize: 12 }}>No clients match search.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated A4 Reports */}
      {!activeSheets.length ? (
        <div className="card">
          <div className="empty">
            No report selected. Please select one or more report types above to preview and print.
          </div>
        </div>
      ) : (
        <div className="reports-stack">
          {activeSheets.map((rt) => {
            const { rows, clientsForSheet } = getReportData(rt.id)
            const hiddenForSolo = soloPrintId && soloPrintId !== rt.id
            const count = (fn) => rows.filter(fn).length

            return (
              <div
                key={rt.id}
                className={'sheet' + (hiddenForSolo ? ' print-hide' : '')}
              >
                {/* Sheet Top Action Bar (hidden during print) */}
                <div
                  className="no-print"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                    marginBottom: 8,
                    paddingBottom: 6,
                    borderBottom: '1px dashed #cbd5e1',
                  }}
                >
                  <button
                    type="button"
                    className="btn s sm"
                    style={{ color: '#111', borderColor: '#cbd5e1', background: '#f1f5f9' }}
                    onClick={() => printIndividual(rt.id, rt.title)}
                  >
                    🖨 Print This Report
                  </button>
                  <button
                    type="button"
                    className="btn s sm"
                    style={{ color: '#111', borderColor: '#cbd5e1', background: '#f1f5f9' }}
                    onClick={() => printIndividual(rt.id, rt.title)}
                  >
                    ⬇ Save as PDF
                  </button>
                </div>

                {/* Official A4 Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #111',
                    paddingBottom: 8,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <h2>{s.settings.company}</h2>
                    <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{rt.title}</div>
                  </div>
                  <div style={{ textAlign: 'right', lineHeight: 1.5 }}>
                    Generated: {fmt(TODAY())}
                    <br />
                    Period: {fmt(from)} – {fmt(to)}
                    <br />
                    Work Type: {workType || rt.category || 'All'} · Status: {statusFilter || 'All'}
                  </div>
                </div>

                {/* Client & Warranty Summary (Sales Report or Specific Client Selection) */}
                {clientsForSheet.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 13 }}>
                      Client &amp; Warranty Details ({clientsForSheet.length})
                    </h4>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Client / Company</th>
                          <th>Contact / Phone</th>
                          <th>Product / Model</th>
                          <th>Serial / Qty</th>
                          <th>Sale / Start</th>
                          <th>Warranty</th>
                          <th>Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientsForSheet.map((c, idx) => {
                          const w = warr(c)
                          return (
                            <tr key={c.id}>
                              <td>{idx + 1}</td>
                              <td>
                                <b>{clientTitle(c)}</b>
                                {c.address ? <div>{c.address}</div> : null}
                              </td>
                              <td>
                                {clientContact(c) || '—'}
                                <div>{c.phone || '—'}</div>
                                {c.email ? <div>{c.email}</div> : null}
                              </td>
                              <td>
                                {c.productType || '—'} · {clientProduct(c)}
                              </td>
                              <td>
                                {c.serial || '—'} (Qty: {c.quantity || 1})
                              </td>
                              <td>{fmt(c.saleDate)}</td>
                              <td>
                                {w.months}m ({w.active ? `Active, ${w.left}d left` : `Expired ${-w.left}d ago`})
                              </td>
                              <td>{fmt(w.exp)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Work Summary & Records */}
                <p style={{ margin: '8px 0' }}>
                  <b>Total Works:</b> {rows.length} &nbsp; <b>Completed:</b>{' '}
                  {count((w) => w.status === 'done')} &nbsp; <b>Pending:</b>{' '}
                  {count((w) => status(w) === 'pending')} &nbsp; <b>Overdue:</b>{' '}
                  {count((w) => status(w) === 'overdue')}
                </p>

                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Client</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Work / Description / Notes</th>
                      <th>Engineer</th>
                      <th>Status</th>
                      <th className="no-print">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((w, i) => (
                      <tr key={w.id}>
                        <td>{i + 1}</td>
                        <td>{fmt(w.date)}</td>
                        <td>{w.time}</td>
                        <td>{cname(w.clientId)}</td>
                        <td>{w.category}</td>
                        <td>{w.priority || 'Normal'}</td>
                        <td>
                          <b>{w.title}</b>
                          {w.desc && w.desc !== w.title ? <div>{w.desc}</div> : null}
                          {w.notes ? <div>Note: {w.notes}</div> : null}
                        </td>
                        <td>{w.engineer || '—'}</td>
                        <td>{statusLabel(w)}</td>
                        <td className="no-print">
                          <button
                            type="button"
                            className="btn s sm"
                            style={{ color: '#111', borderColor: '#bbb', background: '#eef1f7' }}
                            onClick={() => editWork(w)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center' }}>
                          No work records match the selected filters for this report.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="sig">
                  <div>Prepared by</div>
                  <div>Checked by</div>
                  <div>Client / Approved</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
