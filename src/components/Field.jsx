export default function Field({ label, wide, children }) {
  return (
    <label className={'f' + (wide ? ' w' : '')}>
      <span>{label}</span>
      {children}
    </label>
  )
}
