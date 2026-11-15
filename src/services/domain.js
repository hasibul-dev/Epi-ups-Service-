import { uid, TODAY, addD, addM, diff } from './dates.js'

export const CATS = ['Sales', 'Servicing', 'Maintenance', 'Installation', 'General']
export const CLIENT_TYPES = ['Sales', 'Servicing', 'Maintenance']
export const PRODUCT_TYPES = ['UPS', 'Battery', 'AVR', 'STS', 'PCD', 'Other']
export const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent']

export const clientType = (c) => (c && c.clientType) || 'Sales'
export const clientTitle = (c) => (c ? c.company || c.name || 'Unnamed Client' : '—')
export const clientContact = (c) =>
  c ? c.contactPerson || (c.company && c.name && c.name !== c.company ? c.name : '') : ''
export const clientProduct = (c) =>
  c ? c.product || [c.productType, c.model].filter(Boolean).join(' ') || '—' : '—'

// Extract client title and contact for a work record (supports both database clients and manual entries)
export const workClientName = (w, clients = []) => {
  if (!w) return '—'
  if (w.clientName || w.clientCompany) {
    if (w.clientCompany && w.clientName && w.clientCompany !== w.clientName) {
      return `${w.clientCompany} (${w.clientName})`
    }
    return w.clientCompany || w.clientName
  }
  if (w.clientId) {
    const c = clients.find((x) => x.id === w.clientId)
    if (c) return clientTitle(c)
  }
  return '—'
}

export const workClientContact = (w, clients = []) => {
  if (!w) return ''
  const parts = []
  if (w.clientPhone) parts.push(w.clientPhone)
  if (w.clientAddress) parts.push(w.clientAddress)
  if (parts.length > 0) return parts.join(' · ')
  if (w.clientId) {
    const c = clients.find((x) => x.id === w.clientId)
    if (c) {
      const contact = clientContact(c)
      const phone = c.phone
      return [contact, phone].filter(Boolean).join(' · ')
    }
  }
  return ''
}

// Warranty: start date, expiry date, days left, active flag, total months
export const warr = (c) => {
  if (!c || !c.saleDate) return { start: '', exp: '', left: 0, active: false, months: 0 }
  let months = 0
  if (c.wUnit === 'years') months = (Number(c.wValue) || 0) * 12
  else if (c.wUnit === 'months') months = Number(c.wValue) || 0
  else months = c.wType === 'custom' ? Number(c.wMonths) || 0 : (Number(c.wType) || 0) * 12
  const exp = addM(c.saleDate, months)
  const left = diff(exp, TODAY())
  return { start: c.saleDate, exp, left, active: left >= 0, months }
}

export const status = (w) => (w.status === 'done' ? 'done' : w.date < TODAY() ? 'overdue' : 'pending')
export const isOverdue = (w) => status(w) === 'overdue'
export const isUpcomingSoon = (w, days = 2) => {
  const T = TODAY()
  return w.status === 'pending' && w.date > T && w.date <= addD(T, days)
}

export const byTime = (a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))

// Automatic 3-month maintenance reminders for Sales Clients based on Sale Date.
// Safe to call repeatedly (no duplicates: unique key = clientId|date, one pending reminder per client).
export function sync(state) {
  const works = [...state.works]
  state.clients.forEach((c) => {
    if (clientType(c) !== 'Sales' || !c.saleDate) return
    const auto = works.filter((w) => w.auto && w.clientId === c.id)
    if (auto.some((w) => w.status === 'pending')) return
    const last = [...auto].sort((x, y) => x.date.localeCompare(y.date)).pop()
    const base = last ? last.date : c.saleDate
    const date = addM(base, 3)
    const key = c.id + '|' + date
    if (works.some((w) => w.key === key)) return
    works.push({
      id: uid(),
      key,
      auto: 1,
      clientId: c.id,
      title: '3-Month Maintenance — ' + clientProduct(c),
      category: 'Maintenance',
      priority: 'Normal',
      date,
      time: '10:00',
      engineer: '',
      desc: 'Automatic 3-month periodic maintenance reminder based on Sale Date',
      notes: '',
      status: 'pending',
    })
  })
  return { ...state, works }
}
