import { useState } from 'react'
import Modal from './Modal.jsx'
import Field from './Field.jsx'
import { CATS, PRIORITIES, clientContact, clientTitle, clientType } from '../services/domain.js'
import { useApp } from '../context/AppContext.jsx'
import { TODAY } from '../services/dates.js'

export default function WorkForm({ init, onSave, onClose }) {
  const { s } = useApp()
  const isEdit = Boolean(init && init.id)

  const [f, setF] = useState(() => ({
    category: init?.category || 'Servicing',
    priority: init?.priority || 'Normal',
    status: init?.status || 'pending',
    date: init?.date || TODAY(),
    time: init?.time || '10:00',
    engineer: init?.engineer || '',
    title: init?.title || '',
    desc: init?.desc || '',
    notes: init?.notes || '',
    clientId: init?.clientId || '',
    clientName: init?.clientName || '',
    clientPhone: init?.clientPhone || '',
    clientCompany: init?.clientCompany || '',
    clientAddress: init?.clientAddress || '',
    ...init,
  }))

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  // General Work and Installation are strictly 100% manual entry (no client dropdown or auto-fetch)
  const isStrictlyManual = f.category === 'General' || f.category === 'Installation'
  const isManualClient = isStrictlyManual || !f.clientId

  const ok = f.title.trim() && f.date
  const engineers = s.settings.engineers.split(',').map((x) => x.trim()).filter(Boolean)

  const handleSave = () => {
    const payload = {
      ...f,
      clientId: isStrictlyManual ? '' : f.clientId,
      clientName: f.clientName.trim(),
      clientPhone: f.clientPhone.trim(),
      clientCompany: f.clientCompany.trim(),
      clientAddress: f.clientAddress.trim(),
      title: f.title.trim(),
      desc: f.desc.trim(),
      notes: f.notes.trim(),
      engineer: f.engineer.trim(),
    }
    onSave(payload)
    onClose()
  }

  const selectedDbClient = f.clientId ? s.clients.find((c) => c.id === f.clientId) : null

  return (
    <Modal
      title={isEdit ? `Edit Work Record — ${f.category}` : `Add Work — ${f.category}`}
      onClose={onClose}
      wide
    >
      <div className="fg" style={{ marginBottom: 12 }}>
        <Field label="Work Category *">
          <select
            value={f.category}
            onChange={(e) => {
              const newCat = e.target.value
              const nowManual = newCat === 'General' || newCat === 'Installation'
              setF((prev) => ({
                ...prev,
                category: newCat,
                clientId: nowManual ? '' : prev.clientId,
              }))
            }}
          >
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c === 'Installation' ? '🔌 Installation' : c === 'General' ? '📋 General' : c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Work Priority">
          <select value={f.priority || 'Normal'} onChange={set('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Client Section: Strictly Manual for General & Installation; Optional Link for Sales/Service/Maintenance */}
      <div className="form-section">
        <div className="form-section-title">
          {isStrictlyManual
            ? `Client Information (Manual Data Entry — ${f.category})`
            : 'Client Information'}
        </div>

        {!isStrictlyManual && (
          <div className="fg" style={{ marginBottom: 10 }}>
            <Field label="Link to Client in Database (Optional)" wide>
              <select
                value={f.clientId}
                onChange={(e) => {
                  const cid = e.target.value
                  const c = s.clients.find((x) => x.id === cid)
                  setF((prev) => ({
                    ...prev,
                    clientId: cid,
                    // If client selected, pre-fill but keep editable
                    clientName: c ? c.contactPerson || c.name : prev.clientName,
                    clientCompany: c ? c.company : prev.clientCompany,
                    clientPhone: c ? c.phone : prev.clientPhone,
                    clientAddress: c ? c.address : prev.clientAddress,
                  }))
                }}
              >
                <option value="">— Enter Client Manually / No Database Client —</option>
                {s.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {clientTitle(c)} ({clientType(c)}) {clientContact(c) ? `— ${clientContact(c)}` : ''}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {/* Manual Client Input Fields */}
        <div className="fg">
          <Field label="Client Name">
            <input
              placeholder="e.g. Rahim Uddin"
              value={f.clientName}
              onChange={set('clientName')}
            />
          </Field>
          <Field label="Contact Number">
            <input
              placeholder="e.g. 01711-000000"
              value={f.clientPhone}
              onChange={set('clientPhone')}
            />
          </Field>
          <Field label="Company Name (Optional)">
            <input
              placeholder="e.g. Alpha Power Ltd"
              value={f.clientCompany}
              onChange={set('clientCompany')}
            />
          </Field>
          <Field label="Address" wide>
            <input
              placeholder="Site, office or installation address"
              value={f.clientAddress}
              onChange={set('clientAddress')}
            />
          </Field>
        </div>

        {selectedDbClient && !isStrictlyManual && (
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            Linked to client record: <b>{clientTitle(selectedDbClient)}</b> ({clientType(selectedDbClient)})
          </div>
        )}
      </div>

      {/* Work Details Section */}
      <div className="form-section">
        <div className="form-section-title">Work Details &amp; Schedule</div>
        <div className="fg">
          <Field label="Work Title *" wide>
            <input
              placeholder={
                f.category === 'Installation'
                  ? 'e.g. 10kVA Online UPS Installation & Battery Rack Setup'
                  : f.category === 'General'
                  ? 'e.g. Electrical earthing inspection & load check'
                  : 'e.g. Battery replacement & calibration'
              }
              value={f.title}
              onChange={set('title')}
            />
          </Field>

          <Field label="Schedule Date *">
            <input type="date" value={f.date} onChange={set('date')} />
          </Field>

          <Field label="Schedule Time">
            <input type="time" value={f.time} onChange={set('time')} />
          </Field>

          <Field label="Assigned Technician / Employee" wide>
            <input
              list="engineers-list"
              placeholder="Select or enter technician name"
              value={f.engineer}
              onChange={set('engineer')}
            />
            <datalist id="engineers-list">
              {engineers.map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
          </Field>

          <Field label="Status" wide>
            <select value={f.status || 'pending'} onChange={set('status')}>
              <option value="pending">Pending</option>
              <option value="done">Completed</option>
            </select>
          </Field>

          <Field label="Work Description" wide>
            <textarea
              rows="2"
              placeholder="Describe the task, work scope, or equipment specifications"
              value={f.desc}
              onChange={set('desc')}
            />
          </Field>

          <Field label="Notes" wide>
            <textarea
              rows="2"
              placeholder="Additional remarks, inspection findings, or parts replaced"
              value={f.notes}
              onChange={set('notes')}
            />
          </Field>
        </div>
      </div>

      <div className="row" style={{ marginTop: 14, justifyContent: 'flex-end', marginBottom: 0 }}>
        <button type="button" className="btn s" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary-highlight"
          disabled={!ok}
          onClick={handleSave}
        >
          {isEdit ? 'Save Changes' : 'Save Work'}
        </button>
      </div>
    </Modal>
  )
}
