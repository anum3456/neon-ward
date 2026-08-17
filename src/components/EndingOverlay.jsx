export default function EndingOverlay({ onRestart, onDismiss }) {
  return (
    <div className="ending">
      <div className="ending__inner">
        <span className="eyebrow">The pattern is complete</span>
        <h2 className="ending__title">The block wakes up</h2>
        <p className="ending__desc">
          Before Neon Ward went quiet, a courier used to feed the koi
          light — one color at a time, every night, until the whole
          block glowed. The pattern was never lost. Watch it ripple
          outward now, tower by tower, sign by sign.
        </p>
        <div className="ending__actions">
          <button className="ending__btn" onClick={onRestart}>
            Trace it again
          </button>
          <button className="ending__btn ending__btn--ghost" onClick={onDismiss}>
            Keep exploring
          </button>
        </div>
      </div>
    </div>
  )
}
