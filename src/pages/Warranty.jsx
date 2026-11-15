import { useApp } from '../context/AppContext.jsx'
import { WarrantyBadge, ClientTypeBadge } from '../components/Badges.jsx'
import { clientContact, clientProduct, clientTitle, warr } from '../services/domain.js'
import { fmt } from '../services/dates.js'

export default function Warranty() {
  const { s, editClient } = useApp()
  const list = [...s.clients]
    .filter((c) => Boolean(c.saleDate))
    .sort((a, b) => warr(a).left - warr(b).left)
  const active = list.filter((c) => warr(c).active).length
  const soon = list.filter((c) => warr(c).active && warr(c).left <= 30).length

  return (
    <>
      <div className="grid">
        <div className="stat"><b style={{ color: 'var(--g)' }}>{active}</b><span>Active Warranties</span></div>
        <div className="stat"><b style={{ color: 'var(--r)' }}>{list.length - active}</b><span>Expired</span></div>
        <div className="stat"><b style={{ color: 'var(--y)' }}>{soon}</b><span>Expiring in 30 days</span></div>
      </div>
      <div className="card">
        <h3>🛡 Warranty Management (Tracked Separately from Maintenance)</h3>
        {list.length ? (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Start / Sale</th>
                  <th>Duration</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const w = warr(c)
                  return (
                    <tr key={c.id}>
                      <td>
                        <b>{clientTitle(c)}</b>
                        {clientContact(c) && <div className="muted">{clientContact(c)}</div>}
                      </td>
                      <td><ClientTypeBadge c={c} /></td>
                      <td>
                        {clientProduct(c)}
                        {c.serial && <div className="muted">SN: {c.serial}</div>}
                      </td>
                      <td>{fmt(c.saleDate)}</td>
                      <td>{w.months} months</td>
                      <td>{fmt(w.exp)}</td>
                      <td><WarrantyBadge c={c} /></td>
                      <td>
                        <button className="btn s sm" onClick={() => editClient(c)}>Edit</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="empty">No clients with warranty dates.</div>}
      </div>
    </>
  )
}
