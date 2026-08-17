import { flyKeys } from './FlyControls.jsx'

function DButton({ code, label, className }) {
  const press = (e) => {
    e.preventDefault()
    flyKeys[code] = true
  }
  const release = (e) => {
    e.preventDefault()
    flyKeys[code] = false
  }
  return (
    <button
      className={`dpad__btn ${className || ''}`}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  )
}

export default function FlyDPad() {
  return (
    <div className="dpad">
      <div className="dpad__cluster dpad__cluster--move">
        <DButton code="KeyW" label="▲" className="dpad__btn--up" />
        <DButton code="KeyA" label="◀" className="dpad__btn--left" />
        <DButton code="KeyS" label="▼" className="dpad__btn--down" />
        <DButton code="KeyD" label="▶" className="dpad__btn--right" />
      </div>
      <div className="dpad__cluster dpad__cluster--vertical">
        <DButton code="Space" label="UP" className="dpad__btn--tall" />
        <DButton code="ShiftLeft" label="DOWN" className="dpad__btn--tall" />
      </div>
    </div>
  )
}
