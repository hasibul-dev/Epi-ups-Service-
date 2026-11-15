import { useState } from 'react'
import Modal from './Modal.jsx'
import Field from './Field.jsx'
import { CATS, PRIORITIES, clientTitle, clientType } from '../services/domain.js'
import { useApp } from '../context/AppContext.jsx'

export default function WorkForm({ init, onSave, onClose }) {
  const { s } = useApp()
  const [f, setF] = useState({ priority: 'Normal', ...init })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ok = f.title.trim() && f.date
  const engineers = s.settings.engineers.split(',').map((x) => x.trim()).filter(Boolean)

  return (
    <Modal title={f.id ? 'Edit Work Record' : 'Add Work — Manual Schedule'} onClose={onClose}>
      <div className="fg">
        <Field label="Select Client" wide>
          <select value={f.clientId} onChange={set('clientId')}>
            <option value="">— No Client / Internal —</option>
            {s.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {clientTitle(c)} ({clientType(c)})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Work Category *">
          <select value={f.category} onChange={set('category')}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Work Priority">
          <select value={f.priority || 'Normal'} onChange={set('priority')}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Work Title *" wide>
          <input placeholder="e.g. UPS battery replacement" value={f.title} onChange={set('title')} />
        </Field>
        <Field label="Work Date *"><input type="date" value={f.date} onChange={set('date')} /></Field>
        <Field label="Work Time"><input type="time" value={f.time} onChange={set('time')} /></Field>
        <Field label="Assigned Engineer" wide>
          <input list="engineers" placeholder="Engineer name" value={f.engineer} onChange={set('engineer')} />
          <datalist id="engineers">{engineers.map((x) => <option key={x} value={x} />)}</datalist>
        </Field>
        {f.id && (
          <Field label="Status" wide>
            <select value={f.status} onChange={set('status')}>
              <option value="pending">Pending</option>
              <option value="done">Completed</option>
            </select>
          </Field>
        )}
        <Field label="Work Description" wide>
          <textarea rows="2" placeholder="Describe the task or scope of work" value={f.desc} onChange={set('desc')} />
        </Field>
        <Field label="Notes" wide>
          <textarea rows="2" placeholder="Additional remarks or findings" value={f.notes} onChange={set('notes')} />
        </Field>
      </div>
      <div className="row" style={{ marginTop: 14, justifyContent: 'flex-end', marginBottom: 0 }}>
        <button type="button" className="btn s" onClick={onClose}>Cancel</button>
        <button type="button" className="btn" disabled={!ok} onClick={() => { onSave(f); onClose() }}>Save Work</button>
      </div>
    </Modal>
  )
}
