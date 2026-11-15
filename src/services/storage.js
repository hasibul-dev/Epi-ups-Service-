// STORAGE ADAPTER — replace the body of these functions to use a real database later.
const KEY = 'epi_ups_v1'

export const DB = {
  load() {
    try { return JSON.parse(localStorage.getItem(KEY)) } catch (e) { return null }
  },
  save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch (e) { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(KEY) } catch (e) { /* ignore */ }
  },
}
