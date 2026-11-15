export default function Modal({ title, onClose, wide, children }) {
  return (
    <div className="ov" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' modal-wide' : '')}>
        <div className="row">
          <h3 style={{ flex: 1, margin: 0 }}>{title}</h3>
          <button className="btn s sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
