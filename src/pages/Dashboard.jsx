import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import { clientType, isOverdue, isUpcomingSoon, warr } from '../services/domain.js'
import { TODAY } from '../services/dates.js'

export default function Dashboard({ go }) {
  const { s, addWork, addClient } = useApp()
  const T = TODAY()
  const today = s.works.filter((w) => w.date === T)
  const overdue = s.works.filter((w) => isOverdue(w))
  const upcoming = s.works.filter((w) => isUpcomingSoon(w, 2))

  const salesClients = s.clients.filter((c) => clientType(c) === 'Sales')
  const servicingClients = s.clients.filter((c) => clientType(c) === 'Servicing')
  const maintenanceClients = s.clients.filter((c) => clientType(c) === 'Maintenance')
  const expiring = salesClients.filter((c) => warr(c).active && warr(c).left <= 30).length

  const Stat = ({ n, label, color, page }) => (
    <div className="stat" style={{ cursor: 'pointer' }} onClick={() => go(page)}>
      <b style={{ color }}>{n}</b><span>{label}</span>
    </div>
  )

  return (
    <div className="dashboard-layout">
      {/* 1. Primary Dashboard Action Hub: Sales Clients, + Add Client, + Add Work */}
      <section className="card action-hub">
        <div className="action-hub-header">
          <div>
            <h2 className="action-hub-title">⚡ EPI UPS Control Center</h2>
            <p className="action-hub-subtitle">
              Manage sales clients, register multi-category clients, and schedule service or maintenance work
            </p>
          </div>
          <button
            type="button"
            className="btn btn-add-work"
            onClick={() => addWork(T)}
            title="Manually schedule a new work task"
          >
            <span>🗓️</span>
            <span>+ Add Work</span>
          </button>
        </div>

        <div className="hero-actions-grid">
          <button
            type="button"
            className="hero-action-card hero-sales-clients"
            onClick={() => go('clients')}
          >
            <div className="hero-icon">👥</div>
            <div className="hero-body">
              <div className="hero-title">Sales Clients</div>
              <div className="hero-desc">
                View, search, edit &amp; manage {salesClients.length} sales client{salesClients.length === 1 ? '' : 's'} &amp; warranties
              </div>
            </div>
            <div className="hero-arrow">→</div>
          </button>

          <button
            type="button"
            className="hero-action-card hero-add-client"
            onClick={() => addClient('Sales')}
          >
            <div className="hero-icon">➕</div>
            <div className="hero-body">
              <div className="hero-title">+ Add Client</div>
              <div className="hero-desc">
                Register a new Sales, Servicing or Maintenance client
              </div>
            </div>
            <div className="hero-arrow">→</div>
          </button>
        </div>

        <div className="quick-section-links">
          <button type="button" className="quick-link-pill" onClick={() => go('servicing')}>
            <span>🛠️ Servicing Clients</span>
            <span className="bd y">{servicingClients.length}</span>
          </button>
          <button type="button" className="quick-link-pill" onClick={() => go('maintenance')}>
            <span>⚙️ Maintenance Clients</span>
            <span className="bd g">{maintenanceClients.length}</span>
          </button>
          <button type="button" className="quick-link-pill" onClick={() => go('history')}>
            <span>🕘 Complete Work History</span>
          </button>
          <button type="button" className="quick-link-pill" onClick={() => go('calendar')}>
            <span>🗓️ Full Schedule</span>
          </button>
        </div>
      </section>

      {/* 2. Key Metrics Stats Grid */}
      <div className="grid">
        <Stat n={today.length} label="Today's Scheduled" page="today" />
        <Stat n={today.filter((w) => w.status === 'done').length} label="Completed Today" color="var(--g)" page="today" />
        <Stat n={upcoming.length} label="Upcoming (Next 2d)" color="var(--a)" page="upcoming" />
        <Stat n={overdue.length} label="Overdue Tasks" color="var(--r)" page="today" />
        <Stat n={salesClients.length} label="Sales Clients" page="clients" />
        <Stat n={expiring} label="Warranty ≤30d" color="var(--y)" page="warranty" />
      </div>

      {/* 3. Separate Overdue Alert Section (when overdue tasks exist) */}
      {overdue.length > 0 && (
        <div className="card overdue-card">
          <div className="card-header-bar">
            <div>
              <h3 className="card-title" style={{ color: '#ff8f8f' }}>
                ⚠ Overdue Work &amp; Maintenance ({overdue.length})
              </h3>
              <span className="card-subtitle">
                Tasks whose scheduled date passed without completion
              </span>
            </div>
            <button className="btn s sm" onClick={() => go('today')}>Manage Overdue</button>
          </div>
          <WorkTable list={overdue} />
        </div>
      )}

      {/* 4. Two-column Work Overview: Today Work & Upcoming Work (Next 2 Days) */}
      <div className="dashboard-split">
        <div className="card split-card">
          <div className="card-header-bar">
            <div>
              <h3 className="card-title">📅 Today Work</h3>
              <span className="card-subtitle">
                {today.length} task{today.length === 1 ? '' : 's'} scheduled today
              </span>
            </div>
            <div className="card-actions">
              <button className="btn s sm" onClick={() => go('today')}>View All</button>
              <button className="btn sm" onClick={() => addWork(T)}>+ Add Work</button>
            </div>
          </div>
          <WorkTable list={today} empty="Nothing scheduled today 🎉" />
        </div>

        <div className="card split-card">
          <div className="card-header-bar">
            <div>
              <h3 className="card-title">⏭ Upcoming Work (Next 2 Days)</h3>
              <span className="card-subtitle">
                {upcoming.length} task{upcoming.length === 1 ? '' : 's'} due within 2 days
              </span>
            </div>
            <button className="btn s sm" onClick={() => go('upcoming')}>View All</button>
          </div>
          <WorkTable list={upcoming} empty="No upcoming work in the next 2 days." />
        </div>
      </div>
    </div>
  )
}
