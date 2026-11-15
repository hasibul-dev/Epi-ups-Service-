# EPI UPS Service & Maintenance Management System

React + Vite. Data is stored in browser **localStorage** (local testing only).

## Run
```
npm install
npm run dev
```
Open the URL shown (usually http://localhost:5173).

## Connect your own database later
Only edit `src/services/storage.js` (`load`, `save`, `clear`). Everything else
(components, pages, reminder logic) stays unchanged. For async APIs, change
`useStore` in `src/hooks/useStore.js` to load/save asynchronously.

## Structure
- `src/services/` storage adapter, date helpers, domain logic (warranty, 3-month reminders), demo seed
- `src/hooks/useStore.js` single state store + auto-persist
- `src/context/AppContext.jsx` shared state + work form modal
- `src/components/` reusable UI
- `src/pages/` one file per sidebar menu
