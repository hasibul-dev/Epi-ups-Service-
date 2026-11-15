import { status, warr, clientType } from '../services/domain.js'

export function StatusBadge({ w }) {
  const s = status(w)
  const cls = s === 'done' ? 'g' : s === 'overdue' ? 'r' : 'y'
  const txt = s === 'done' ? 'Completed' : s === 'overdue' ? 'Overdue' : 'Pending'
  return <span className={'bd ' + cls}>{txt}</span>
}

export function PriorityBadge({ priority = 'Normal' }) {
  const p = priority || 'Normal'
  const cls = p === 'Urgent' ? 'r' : p === 'High' ? 'y' : p === 'Low' ? 'm' : 'b'
  return <span className={'bd ' + cls}>{p}</span>
}

export function ClientTypeBadge({ c }) {
  const t = clientType(c)
  const cls = t === 'Sales' ? 'b' : t === 'Servicing' ? 'y' : 'g'
  return <span className={'bd ' + cls}>{t}</span>
}

export function WarrantyBadge({ c }) {
  const w = warr(c)
  if (!w.start) return <span className="bd m">N/A</span>
  const cls = w.active ? (w.left <= 30 ? 'y' : 'g') : 'r'
  return <span className={'bd ' + cls}>{w.active ? `Active · ${w.left}d left` : `Expired · ${-w.left}d ago`}</span>
}
