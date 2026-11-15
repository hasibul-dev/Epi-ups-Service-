export const uid = () => Math.random().toString(36).slice(2, 10)

export const iso = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4)
  return z.toISOString().slice(0, 10)
}
export const TODAY = () => iso(new Date())

export const addD = (s, n) => {
  const d = new Date(s + 'T00:00')
  d.setDate(d.getDate() + n)
  return iso(d)
}

export const addM = (s, n) => {
  const d = new Date(s + 'T00:00')
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, max))
  return iso(d)
}

export const diff = (a, b) =>
  Math.round((new Date(a + 'T00:00') - new Date(b + 'T00:00')) / 864e5)

export const fmt = (s) =>
  s
    ? new Date(s + 'T00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
