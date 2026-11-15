import { useApp } from '../context/AppContext.jsx'
import { StatusBadge, PriorityBadge } from './Badges.jsx'
import { byTime, clientTitle, clientContact } from '../services/domain.js'
import { fmt, TODAY } from '../services/dates.js'

export default function WorkTable({ list, empty = 'No work found.' }) {
  const { s, upd, editWork } = useApp()
  const clientInfo = (id) => {
    const c = s.clients.find((x) => x.id === id)
    if (!c) return { title: '—', sub: '' }
    return { title: clientTitle(c), sub: clientContact(c) }
  }
  const complete = (w) =>
    upd((p) => ({
      ...p,
      works: p.works.map((x) => (x.id === w.id ? { ...x, status: 'done', doneAt: TODAY() } : x)),
    }))
  const reopen = (w) =>
    upd((p) => ({
      ...p,
      works: p.works.map((x) => (x.id === w.id ? { ...x, status: 'pending', doneAt: '' } : x)),
    }))
  const remove = (w) =>
    window.confirm('Delete this work?') &&
    upd((p) => ({ ...p, works: p.works.filter((x) => x.id !== w.id) }))

  if (!list.length) return <div className="empty">{empty}</div>
  return (
    <div className="tw">
      <table>
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>Work</th>
            <th>Client</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Engineer</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[...list].sort(byTime).map((w) => {
            const ci = clientInfo(w.clientId)
            return (
              <tr key={w.id}>
                <td>
                  {fmt(w.date)}
                  <div className="muted">{w.time}</div>
                </td>
                <td>
                  <b>{w.title}</b>
                  {w.auto ? <span className="bd b" style={{ marginLeft: 6 }}>Auto 3M</span> : null}
                  {w.desc && w.desc !== w.title ? <div className="muted">{w.desc}</div> : null}
                  {w.notes ? <div className="muted" style={{ fontSize: 12 }}>Note: {w.notes}</div> : null}
                </td>
                <td>
                  <div>{ci.title}</div>
                  {ci.sub ? <div className="muted" style={{ fontSize: 12 }}>{ci.sub}</div> : null}
                </td>
                <td><span className="bd b">{w.category}</span></td>
                <td><PriorityBadge priority={w.priority} /></td>
                <td>{w.engineer || '—'}</td>
                <td><StatusBadge w={w} /></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {w.status === 'done'
                    ? <button className="btn s sm" onClick={() => reopen(w)}>Reopen</button>
                    : <button className="btn g sm" onClick={() => complete(w)}>✓ Complete</button>}{' '}
                  <button className="btn s sm" onClick={() => editWork(w)}>Edit</button>{' '}
                  <button className="btn d sm" onClick={() => remove(w)}>Del</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
