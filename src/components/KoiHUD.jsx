import { KOI } from './KoiPond.jsx'

const COLOR_MAP = Object.fromEntries(KOI.map((k) => [k.id, k.color]))

export default function KoiHUD({ sequence, progress, solved, hidden }) {
  if (hidden || solved) return null
  return (
    <div className="koi-hud">
      <span className="koi-hud__label">Wake the block — click the koi in this order</span>
      <div className="koi-hud__dots">
        {sequence.map((id, i) => (
          <span
            key={i}
            className={`koi-hud__dot ${i < progress ? 'is-done' : ''}`}
            style={{ '--dot-color': COLOR_MAP[id] }}
          />
        ))}
      </div>
    </div>
  )
}
