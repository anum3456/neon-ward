export default function IntroOverlay({ hideHint }) {
  return (
    <div className="overlay">
      <div className="overlay__top">
        <span className="eyebrow">A city block, after midnight</span>
        <h1 className="title">Neon Ward</h1>
      </div>
      <div className="overlay__bottom">
        <p className={`hint ${hideHint ? 'is-hidden' : ''}`}>
          Drag to look around. Something's gone quiet in Neon Ward — find
          the koi pond and trace the pattern to wake the block. Click open
          sky to launch a delivery drone.
        </p>
        <span className="credit">3D Websites Hackathon — built with R3F</span>
      </div>
    </div>
  )
}
