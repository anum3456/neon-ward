export default function Splash({ onEnter }) {
  return (
    <div className="splash">
      <div className="splash__inner">
        <span className="eyebrow">3D Websites Hackathon</span>
        <h1 className="splash__title">Neon Ward</h1>
        <p className="splash__desc">
          A city block that's gone dim and quiet after midnight. Somewhere
          in the rain, in a hidden koi pond, a pattern waits to bring it
          back to life.
        </p>
        <button className="splash__button" onClick={onEnter}>
          Enter the city
        </button>
      </div>
    </div>
  )
}
