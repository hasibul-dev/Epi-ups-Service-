import { useState, useEffect } from 'react'
import { DB } from '../services/storage.js'
import { seed } from '../services/seed.js'
import { sync } from '../services/domain.js'

// Single app state { clients, works, settings } persisted automatically.
export function useStore() {
  const [state, setState] = useState(() => sync(DB.load() || seed()))
  useEffect(() => { DB.save(state) }, [state])
  // upd(fn): apply a change then re-run the reminder sync
  const upd = (fn) => setState((p) => sync(fn(p)))
  return [state, upd, setState]
}
