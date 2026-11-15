import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import { status } from '../services/domain.js'
import { TODAY, addM, fmt } from '../services/dates.js'

export default function CalendarPage() {
  const { s, addWork } = useApp()
  const [month, setMonth] = useState(TODAY().slice(0, 7))
  const [sel, setSel] = useState(TODAY())
  const [view, setView] = useState('calendar')

  const first = new Date(month + '-01T00:00')
  const pad = first.getDay()
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells = [
    ...Array(pad).fill(null),
    ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
  ]
  const shift = (n) => setMonth(addM(month + '-01', n).slice(0, 7))

  return (
    <>
      <div className="card">
        <div className="row">
          <button className="btn s sm" onClick={() => shift(-1)}>◀</button>
          <b style={{ minWidth: 130, textAlign: 'center' }}>{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</b>
          <button className="btn s sm" onClick={() => shift(1)}>▶</button>
          <button className="btn s sm" onClick={() => { setMonth(TODAY().slice(0, 7)); setSel(TODAY()) }}>Today</button>
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="calendar">Calendar</option>
            <option value="monthly">Monthly list</option>
          </select>
          <button className="btn" onClick={() => addWork(sel)}>+ Add on {fmt(sel)}</button>
        </div>
        {view === 'calendar' ? (
          <div className="cal">
            {'SMTWTFS'.split('').map((d, i) => <div className="h" key={i}>{d}</div>)}
            {cells.map((d, i) =>
              d ? (
                <div key={i} className={(d === sel ? 'sel ' : '') + (d === TODAY() ? 'td' : '')} onClick={() => setSel(d)}>
                  {Number(d.slice(8))}
                  <div>
                    {s.works.filter((w) => w.date === d).slice(0, 5).map((w) => (
                      <span key={w.id} className={'dot ' + (status(w) === 'done' ? 'done' : status(w) === 'overdue' ? 'od' : '')} />
                    ))}
                  </div>
                </div>
              ) : <div key={i} className="h" />
            )}
          </div>
        ) : (
          <WorkTable list={s.works.filter((w) => w.date.startsWith(month))} empty="No work this month." />
        )}
      </div>
      {view === 'calendar' && (
        <div className="card">
          <h3>Daily Schedule — {fmt(sel)}</h3>
          <WorkTable list={s.works.filter((w) => w.date === sel)} empty="Nothing scheduled this day." />
        </div>
      )}
    </>
  )
}
