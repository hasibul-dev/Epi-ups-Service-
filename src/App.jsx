import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext.jsx'
import { fmt, TODAY } from './services/dates.js'
import { isOverdue, isUpcomingSoon } from './services/domain.js'
import Dashboard from './pages/Dashboard.jsx'
import TodayWork from './pages/TodayWork.jsx'
import UpcomingWork from './pages/UpcomingWork.jsx'
import Clients from './pages/Clients.jsx'
import Warranty from './pages/Warranty.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import NewWork from './pages/NewWork.jsx'
import History from './pages/History.jsx'
import Report from './pages/Report.jsx'
import Settings from './pages/Settings.jsx'

const NAV = [
  ['dashboard', '📊', 'Dashboard'],
  ['today', '📅', 'Today Work'],
  ['upcoming', '⏭', 'Upcoming Work'],
  ['clients', '💼', 'Sales Clients'],
  ['servicing', '🛠️', 'Servicing Clients'],
  ['maintenance', '⚙️', 'Maintenance Clients'],
  ['warranty', '🛡', 'Warranty Management'],
  ['calendar', '🗓', 'Schedule / Calendar'],
  ['new', '➕', 'Add Work'],
  ['history', '🕘', 'Work History'],
  ['srep', '📄', 'Schedule & Work Reports'],
  ['settings', '⚙', 'Settings'],
]

function Shell() {
  const [page, setPage] = useState('dashboard')
  const [open, setOpen] = useState(false)
  const [reportPreset, setReportPreset] = useState({ clientId: '', reportType: '' })
  const { s } = useApp()

  const T = TODAY()
  const todayPendingCount = s.works.filter(
    (w) => (w.date === T && w.status === 'pending') || isOverdue(w)
  ).length
  const upcomingPendingCount = s.works.filter((w) => isUpcomingSoon(w, 2)).length

  const go = (nextPage) => {
    setReportPreset({ clientId: '', reportType: '' })
    setPage(nextPage)
    setOpen(false)
  }

  const openClientReport = (clientId, category = 'Sales') => {
    const map = {
      Sales: 'sales',
      Servicing: 'servicing',
      Maintenance: 'maintenance',
      General: 'general',
    }
    setReportPreset({ clientId, reportType: map[category] || 'sales' })
    setPage('srep')
    setOpen(false)
  }

  const pages = {
    dashboard: <Dashboard go={go} />,
    today: <TodayWork />,
    upcoming: <UpcomingWork />,
    clients: <Clients category="Sales" onPrintClient={openClientReport} />,
    servicing: <Clients category="Servicing" onPrintClient={openClientReport} />,
    maintenance: <Clients category="Maintenance" onPrintClient={openClientReport} />,
    warranty: <Warranty />,
    calendar: <CalendarPage />,
    new: <NewWork />,
    history: <History onPrintClient={openClientReport} />,
    srep: (
      <Report
        preselectClientId={reportPreset.clientId}
        preselectReport={reportPreset.reportType}
      />
    ),
    settings: <Settings />,
  }
  const currentNav = NAV.find((n) => n[0] === page)
  const title = currentNav ? currentNav[2] : 'Dashboard'

  return (
    <div className="app">
      <aside className={'side' + (open ? ' open' : '')}>
        <div className="logo" onClick={() => go('dashboard')} style={{ cursor: 'pointer' }}>
          ⚡ EPI UPS<small>Service &amp; Maintenance</small>
        </div>
        {NAV.map(([key, icon, label]) => (
          <div key={key} className={'nav' + (page === key ? ' on' : '')} onClick={() => go(key)}>
            <span>{icon}</span>{label}
          </div>
        ))}
      </aside>
      <main className="main">
        <header className="top">
          <div className="top-brand">
            <button className="btn s burger" onClick={() => setOpen(!open)} title="Toggle menu">☰</button>
            <h1 className="top-title">{title}</h1>
          </div>

          <div className="top-shortcuts">
            <button
              className={'top-header-btn' + (page === 'today' ? ' active' : '')}
              onClick={() => go('today')}
              title="Today's scheduled and overdue work"
            >
              <span className="th-icon">📅</span>
              <span className="th-text">Today Work</span>
              {todayPendingCount > 0 ? (
                <span className="th-badge th-badge-alert">{todayPendingCount}</span>
              ) : (
                <span className="th-badge th-badge-ok">0</span>
              )}
            </button>

            <button
              className={'top-header-btn' + (page === 'upcoming' ? ' active' : '')}
              onClick={() => go('upcoming')}
              title="Upcoming pending work (next 2 days)"
            >
              <span className="th-icon">⏭</span>
              <span className="th-text">Upcoming Work</span>
              {upcomingPendingCount > 0 ? (
                <span className="th-badge th-badge-info">{upcomingPendingCount}</span>
              ) : (
                <span className="th-badge th-badge-ok">0</span>
              )}
            </button>
          </div>

          <div className="top-meta">
            <span className="today-badge">🗓️ {fmt(TODAY())}</span>
          </div>
        </header>
        {pages[page]}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
