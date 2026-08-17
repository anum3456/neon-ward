const WAYPOINTS = [
  { key: 'street', label: 'Street' },
  { key: 'skyline', label: 'Skyline' },
  { key: 'overhead', label: 'Overhead' },
]

export default function ControlsUI({ soundOn, onToggleSound, onWaypoint, onFly }) {
  return (
    <div className="controls">
      <div className="controls__group">
        {WAYPOINTS.map((w) => (
          <button key={w.key} className="controls__btn" onClick={() => onWaypoint(w.key)}>
            {w.label}
          </button>
        ))}
        <button className="controls__btn controls__btn--fly" onClick={onFly}>
          ✦ Fly mode
        </button>
      </div>
      <div className="controls__group">
        <button className="controls__btn controls__btn--icon" onClick={onToggleSound} aria-label="Toggle sound">
          {soundOn ? '♪' : '𝄽'}
        </button>
      </div>
    </div>
  )
}
