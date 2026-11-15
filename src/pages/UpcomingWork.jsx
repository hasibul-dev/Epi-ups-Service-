import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import { isUpcomingSoon } from '../services/domain.js'
import { TODAY, addD } from '../services/dates.js'

export default function UpcomingWork() {
  const { s, addWork } = useApp()
  const T = TODAY()
  const soonList = s.works.filter((w) => isUpcomingSoon(w, 2))
  const laterList = s.works.filter((w) => w.status === 'pending' && w.date > addD(T, 2))

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0 }}>⏭ Upcoming Work — Next 2 Days ({soonList.length})</h3>
            <span className="muted" style={{ fontSize: 12 }}>
              Tasks &amp; 3-month maintenance reminders due within the next 48 hours
            </span>
          </div>
          <button className="btn" onClick={() => addWork(addD(T, 1))}>+ Add Work</button>
        </div>
        <WorkTable list={soonList} empty="No upcoming work within the next 2 days." />
      </div>

      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">🗓 Later Scheduled Work ({laterList.length})</h3>
            <span className="card-subtitle">Future tasks scheduled beyond the next 2 days</span>
          </div>
        </div>
        <WorkTable list={laterList} empty="No later work scheduled." />
      </div>
    </>
  )
}
