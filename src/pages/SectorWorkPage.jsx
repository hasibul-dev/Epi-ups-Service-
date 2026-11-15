import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import { PRIORITIES, isOverdue, status } from '../services/domain.js'
import { TODAY } from '../services/dates.js'

export default function SectorWorkPage({ category = 'Installation', onPrintReport }) {
  const { s, addWork } = useApp()
  const [q, setQ] = useState('')
  const [priority, setPriority] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const isInstallation = category === 'Installation'
  const title = isInstallation ? '🔌 Installation Sector' : '📋 General Work Sector'
  const subtitle = isInstallation
    ? 'Independent UPS, battery & equipment installation work orders & site commissioning records'
    : 'Independent manual work orders, routine inspections & general service tasks'

  const sectorWorks = s.works.filter((w) => w.category === category)

  const filtered = sectorWorks.filter((w) => {
    if (priority && (w.priority || 'Normal') !== priority) return false
    if (statusFilter && status(w) !== statusFilter) return false
    if (from && w.date < from) return false
    if (to && w.date > to) return false
    if (q.trim()) {
      const hay = [
        w.title,
        w.desc,
        w.notes,
        w.engineer,
        w.clientName,
        w.clientCompany,
        w.clientPhone,
        w.clientAddress,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q.trim().toLowerCase())) return false
    }
    return true
  })

  const completedCount = sectorWorks.filter((w) => w.status === 'done').length
  const pendingCount = sectorWorks.filter((w) => status(w) === 'pending').length
  const overdueCount = sectorWorks.filter((w) => isOverdue(w)).length

  return (
    <>
      {/* 1. Header & Quick Actions */}
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 18, color: '#fff' }}>{title}</h2>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              {subtitle}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {onPrintReport && (
              <button
                type="button"
                className="btn s"
                onClick={() => onPrintReport(category)}
                title={`Open ${category} Report for printing or PDF export`}
              >
                🖨 {category} Report
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary-highlight"
              onClick={() => addWork(TODAY(), category)}
              title={`Create new manual ${category} work order`}
            >
              + Add {category} Work
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid" style={{ marginTop: 14, marginBottom: 14 }}>
          <div className="stat">
            <b>{sectorWorks.length}</b>
            <span>Total {category}</span>
          </div>
          <div className="stat">
            <b style={{ color: 'var(--g)' }}>{completedCount}</b>
            <span>Completed</span>
          </div>
          <div className="stat">
            <b style={{ color: 'var(--y)' }}>{pendingCount}</b>
            <span>Pending</span>
          </div>
          <div className="stat">
            <b style={{ color: 'var(--r)' }}>{overdueCount}</b>
            <span>Overdue</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <label className="f" style={{ flex: 1, minWidth: 200 }}>
            <span>Search Work or Client</span>
            <input
              placeholder="Search by client name, company, phone, title, technician…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <label className="f">
            <span>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
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
          <label className="f">
            <span>From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="f">
            <span>To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          {(q || priority || statusFilter || from || to) && (
            <button
              type="button"
              className="btn s sm"
              style={{ marginBottom: 4 }}
              onClick={() => {
                setQ('')
                setPriority('')
                setStatusFilter('')
                setFrom('')
                setTo('')
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 2. Work Records Table */}
      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">
              {title} Records ({filtered.length})
            </h3>
            <span className="card-subtitle">
              All independent {category.toLowerCase()} tasks with manual client entry &amp; technician assignment
            </span>
          </div>
          <button
            type="button"
            className="btn s sm"
            onClick={() => addWork(TODAY(), category)}
          >
            + Add {category} Work
          </button>
        </div>
        <WorkTable
          list={filtered}
          empty={`No ${category.toLowerCase()} work records found. Click "+ Add ${category} Work" to create one.`}
        />
      </div>
    </>
  )
}
