import { useState } from 'react'
import Modal from './Modal.jsx'
import Field from './Field.jsx'
import { CLIENT_TYPES, PRODUCT_TYPES, warr } from '../services/domain.js'
import { fmt, TODAY } from '../services/dates.js'

function inferProductType(p = '') {
  const up = p.toUpperCase()
  const match = PRODUCT_TYPES.find((t) => t !== 'Other' && up.includes(t))
  return match || 'UPS'
}

function normalizeInit(init) {
  const isEdit = Boolean(init && init.id)
  const base = {
    clientType: (init && init.clientType) || 'Sales',
    company: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    productType: 'UPS',
    product: '',
    model: '',
    serial: '',
    quantity: 1,
    saleDate: TODAY(),
    wUnit: 'years',
    wValue: 1,
  }
  if (!isEdit) return base

  let wUnit = init.wUnit
  let wValue = init.wValue
  if (!wUnit) {
    if (init.wType === 'custom') {
      wUnit = 'months'
      wValue = Number(init.wMonths) || 12
    } else {
      wUnit = 'years'
      wValue = Number(init.wType) || 1
    }
  }

  return {
    ...base,
    ...init,
    clientType: init.clientType || 'Sales',
    company: init.company || init.name || '',
    contactPerson: init.contactPerson ?? (init.company && init.name !== init.company ? init.name : ''),
    email: init.email || '',
    productType: init.productType || inferProductType(init.product),
    quantity: init.quantity || 1,
    wUnit,
    wValue,
  }
}

export default function ClientForm({ init, onSave, onClose }) {
  const isEdit = Boolean(init && init.id)
  const [f, setF] = useState(() => normalizeInit(init))
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const ok = f.company.trim() && f.saleDate
  const w = f.saleDate ? warr(f) : null

  const handleSave = () => {
    const months = f.wUnit === 'years' ? (Number(f.wValue) || 0) * 12 : Number(f.wValue) || 0
    const productLabel = [f.productType, f.model].filter(Boolean).join(' ')
    const payload = {
      ...f,
      name: f.company.trim(),
      company: f.company.trim(),
      contactPerson: f.contactPerson.trim(),
      quantity: Math.max(1, Number(f.quantity) || 1),
      wValue: Math.max(0, Number(f.wValue) || 0),
      wMonths: months,
      wType: f.wUnit === 'years' && (Number(f.wValue) === 1 || Number(f.wValue) === 2) ? String(f.wValue) : 'custom',
      product: f.product && isEdit && f.product !== f.productType ? f.product : productLabel || f.productType,
    }
    onSave(payload)
    onClose()
  }

  return (
    <Modal title={isEdit ? 'Edit Client' : 'Add Client'} onClose={onClose} wide>
      {/* Client Type Selection */}
      <div className="form-section">
        <div className="form-section-title">Client Type</div>
        <div className="type-selector">
          {CLIENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={'type-pill' + (f.clientType === t ? ' active type-' + t.toLowerCase() : '')}
              onClick={() => setF({ ...f, clientType: t })}
            >
              <span>{t === 'Sales' ? '💼' : t === 'Servicing' ? '🛠️' : '⚙️'}</span>
              <span>{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Client Information */}
      <div className="form-section">
        <div className="form-section-title">Client Information</div>
        <div className="fg">
          <Field label="Client / Company Name *">
            <input placeholder="e.g. Alpha Traders" value={f.company} onChange={set('company')} />
          </Field>
          <Field label="Contact Person">
            <input placeholder="e.g. Rahim Uddin" value={f.contactPerson} onChange={set('contactPerson')} />
          </Field>
          <Field label="Phone Number">
            <input placeholder="e.g. 01711-000000" value={f.phone} onChange={set('phone')} />
          </Field>
          <Field label="Email">
            <input type="email" placeholder="client@company.com" value={f.email} onChange={set('email')} />
          </Field>
          <Field label="Address" wide>
            <input placeholder="Full site / office address" value={f.address} onChange={set('address')} />
          </Field>
        </div>
      </div>

      {/* Product Information */}
      <div className="form-section">
        <div className="form-section-title">Product Information</div>
        <div className="fg">
          <Field label="Product Type *">
            <select value={f.productType} onChange={set('productType')}>
              {PRODUCT_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
            </select>
          </Field>
          <Field label="Product Model">
            <input placeholder="e.g. EPI-OL3K" value={f.model} onChange={set('model')} />
          </Field>
          <Field label="Serial Number">
            <input placeholder="e.g. SN1234567" value={f.serial} onChange={set('serial')} />
          </Field>
          <Field label="Quantity">
            <input type="number" min="1" value={f.quantity} onChange={set('quantity')} />
          </Field>
          <Field label={f.clientType === 'Sales' ? 'Sale Date *' : 'Service / Start Date *'} wide>
            <input type="date" value={f.saleDate} onChange={set('saleDate')} />
          </Field>
        </div>
      </div>

      {/* Warranty Information */}
      <div className="form-section">
        <div className="form-section-title">Warranty Information</div>
        <div className="fg">
          <Field label="Warranty Unit">
            <select value={f.wUnit} onChange={set('wUnit')}>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </Field>
          <Field label={`Duration (${f.wUnit})`}>
            <input type="number" min="0" value={f.wValue} onChange={set('wValue')} />
          </Field>
        </div>
        {w && (
          <div className="warranty-preview">
            <div>
              <span className="muted">Start:</span> <b>{fmt(w.start)}</b> &nbsp;·&nbsp;{' '}
              <span className="muted">Expiry:</span> <b>{fmt(w.exp)}</b>
            </div>
            <div>
              <span className={'bd ' + (w.active ? (w.left <= 30 ? 'y' : 'g') : 'r')}>
                {w.active ? `Active · ${w.left} days remaining` : `Expired · ${-w.left} days ago`}
              </span>
            </div>
          </div>
        )}
        {f.clientType === 'Sales' && (
          <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>
            ℹ A 3-month maintenance schedule will be automatically generated from the Sale Date.
          </p>
        )}
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 0 }}>
        <button type="button" className="btn s" onClick={onClose}>Cancel</button>
        <button type="button" className="btn" disabled={!ok} onClick={handleSave}>
          {isEdit ? 'Save Changes' : 'Save Client'}
        </button>
      </div>
    </Modal>
  )
}
