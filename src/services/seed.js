import { uid, TODAY, addD, addM } from './dates.js'
import { sync } from './domain.js'

export const emptyState = () => ({
  clients: [],
  works: [],
  settings: { company: 'EPI UPS Service Center', engineers: 'Sabbir, Tanvir, Rafi' },
})

export function seed() {
  const T = TODAY()
  const b = addM(T, -3) // sale date whose first reminder falls today
  const mk = (
    name,
    company,
    phone,
    product,
    productType,
    model,
    saleDate,
    wUnit,
    wValue,
    clientType = 'Sales',
    quantity = 1
  ) => ({
    id: uid(),
    clientType,
    name: company,
    company,
    contactPerson: name,
    phone,
    email: name.toLowerCase().replace(/\s+/g, '.') + '@example.com',
    address: 'Dhaka, Bangladesh',
    productType,
    product,
    model,
    serial: 'SN' + Math.floor(Math.random() * 9e6 + 1e6),
    quantity,
    saleDate,
    wUnit,
    wValue,
    wType: wUnit === 'years' && (wValue === 1 || wValue === 2) ? String(wValue) : 'custom',
    wMonths: wUnit === 'years' ? wValue * 12 : wValue,
  })
  const c = [
    mk('Rahim Uddin', 'Alpha Traders', '01711-000001', 'Online UPS 3kVA', 'UPS', 'EPI-OL3K', b, 'years', 1, 'Sales', 2),
    mk('Karim Hasan', 'Beta Pharma', '01811-000002', 'Line Interactive 1kVA', 'UPS', 'EPI-LI1K', addD(b, 1), 'years', 2, 'Sales', 1),
    mk('Sultana Akter', 'Gamma Bank', '01911-000003', 'Online UPS 10kVA', 'UPS', 'EPI-OL10K', addD(T, -100), 'years', 1, 'Sales', 1),
    mk('Jamal Khan', 'Delta Mills', '01611-000004', 'Offline UPS 650VA', 'UPS', 'EPI-OF650', addD(T, -400), 'years', 1, 'Sales', 3),
    mk('Nadia Islam', 'Omega Clinic', '01511-000005', 'Online UPS 6kVA', 'UPS', 'EPI-OL6K', addD(T, -15), 'months', 18, 'Sales', 1),
    mk('Faruk Ahmed', 'Apex Diagnostic', '01722-110022', 'AVR 5kVA', 'AVR', 'EPI-AVR5K', addD(T, -20), 'months', 6, 'Servicing', 1),
    mk('Mina Chowdhury', 'Horizon Tower', '01833-220044', 'SMF Battery Bank', 'Battery', 'EPI-BAT100', addD(T, -45), 'years', 1, 'Maintenance', 8),
  ]
  const w = (
    title,
    category,
    date,
    time,
    engineer,
    clientId,
    st = 'pending',
    notes = '',
    priority = 'Normal',
    manual = {}
  ) => ({
    id: uid(),
    title,
    category,
    priority,
    date,
    time,
    engineer,
    clientId: clientId || '',
    clientName: manual.clientName || '',
    clientPhone: manual.clientPhone || '',
    clientCompany: manual.clientCompany || '',
    clientAddress: manual.clientAddress || '',
    desc: title,
    notes,
    status: st,
    doneAt: st === 'done' ? date : '',
  })
  return sync({
    ...emptyState(),
    clients: c,
    works: [
      w('Install new UPS at client site', 'Sales', T, '11:30', 'Sabbir', c[4].id, 'pending', 'Confirm rack space', 'High'),
      w('Battery bank inspection', 'Maintenance', T, '14:00', 'Tanvir', c[6].id, 'pending', '', 'Normal'),
      w('AVR voltage calibration', 'Servicing', addD(T, 1), '10:30', 'Sabbir', c[5].id, 'pending', 'Bring multimeter', 'High'),
      w(
        '10kVA Online UPS Commissioning',
        'Installation',
        addD(T, 1),
        '12:00',
        'Sabbir',
        '',
        'pending',
        'Rack assembly & input power cabling',
        'High',
        { clientName: 'Rafiqul Islam', clientCompany: 'Vertex Textile Mills', clientPhone: '01799-334455', clientAddress: 'Gazipur, Dhaka' }
      ),
      w(
        'Office stock review & internal check',
        'General',
        addD(T, 1),
        '10:00',
        'Rafi',
        '',
        'pending',
        'Warehouse spare parts inventory',
        'Normal',
        { clientName: 'Admin Office', clientCompany: 'EPI Central Hub', clientPhone: '02-988888', clientAddress: 'Motijheel, Dhaka' }
      ),
      w('Quarterly maintenance visit', 'Maintenance', addD(T, 2), '15:00', 'Tanvir', c[3].id, 'pending', '', 'Normal'),
      w('Scheduled UPS load audit', 'Servicing', addD(T, 7), '11:00', 'Rafi', c[5].id, 'pending', 'Future schedule item', 'Low'),
      w('Annual service completed', 'Servicing', addD(T, -30), '10:00', 'Rafi', c[3].id, 'done', 'All OK, batteries tested', 'Normal'),
      w('Fan replacement', 'Maintenance', addD(T, -3), '12:00', 'Sabbir', c[2].id, 'pending', 'Urgent overheating check', 'Urgent'),
    ],
  })
}
