import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import Scene from './components/Scene.jsx'
import Loader from './components/Loader.jsx'
import IntroOverlay from './components/IntroOverlay.jsx'
import Splash from './components/Splash.jsx'
import ControlsUI from './components/ControlsUI.jsx'
import KoiHUD from './components/KoiHUD.jsx'
import EndingOverlay from './components/EndingOverlay.jsx'
import FlyDPad from './components/FlyDPad.jsx'
import { startAmbience, setAmbienceMuted, playChord } from './utils/audio.js'

function CameraRig({ camera, entered }) {
  useEffect(() => {
    if (!entered || !camera.current) return
    const cam = camera.current
    gsap.to(cam.position, {
      x: 0,
      y: 1.3,
      z: 3.6,
      duration: 2.8,
      ease: 'power3.out',
    })
  }, [entered, camera])
  return null
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const [hideHint, setHideHint] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [waypoint, setWaypoint] = useState(null)
  const [flyMode, setFlyMode] = useState(false)
  const [koiState, setKoiState] = useState({ sequence: [], progress: 0, solved: false })
  const [showEnding, setShowEnding] = useState(false)
  const [koiResetSignal, setKoiResetSignal] = useState(0)
  const cameraRef = useRef()
  const awakeAtRef = useRef(null)

  const handleEnter = () => {
    setEntered(true)
    startAmbience()
  }

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev
      setAmbienceMuted(!next)
      return next
    })
  }

  const handleKoiProgress = useCallback((state) => {
    setKoiState(state)
  }, [])

  const handleKoiSolved = useCallback(() => {
    playChord()
    awakeAtRef.current = performance.now()
    setTimeout(() => {
      setShowEnding(true)
      setWaypoint({ key: 'pond', ts: Date.now() })
    }, 350)
    // once the wake-wave has had time to ripple across the whole skyline,
    // pull the camera back for the full reveal
    setTimeout(() => {
      setWaypoint({ key: 'skyline', ts: Date.now() })
    }, 3200)
  }, [])

  const handleRestart = () => {
    setShowEnding(false)
    setKoiResetSignal((n) => n + 1)
    awakeAtRef.current = null
    setWaypoint({ key: 'street', ts: Date.now() })
  }

  return (
    <div className="app-shell">
      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          dpr={[1, 1.8]}
          camera={{ position: [0, 5.5, 0.01], fov: 45, near: 0.1, far: 40 }}
          onCreated={({ camera }) => {
            cameraRef.current = camera
          }}
        >
          <CameraRig camera={cameraRef} entered={entered} />
          <Scene
            onFirstInteract={() => setHideHint(true)}
            waypoint={waypoint}
            flyMode={flyMode}
            onExitFly={() => setFlyMode(false)}
            onKoiProgress={handleKoiProgress}
            onKoiSolved={handleKoiSolved}
            koiSolved={koiState.solved}
            koiResetSignal={koiResetSignal}
            awakeAtRef={awakeAtRef}
          />
        </Canvas>
      </Suspense>

      {!entered && <Splash onEnter={handleEnter} />}

      {entered && !flyMode && (
        <>
          <IntroOverlay hideHint={hideHint} />
          <KoiHUD
            sequence={koiState.sequence}
            progress={koiState.progress}
            solved={koiState.solved}
            hidden={showEnding}
          />
          <ControlsUI
            soundOn={soundOn}
            onToggleSound={toggleSound}
            onWaypoint={(key) => setWaypoint({ key, ts: Date.now() })}
            onFly={() => setFlyMode(true)}
          />
        </>
      )}

      {entered && showEnding && (
        <EndingOverlay onRestart={handleRestart} onDismiss={() => setShowEnding(false)} />
      )}

      {entered && flyMode && (
        <>
          <div className="fly-hint">
            <span>Drag to look around. Use the buttons to move, or WASD/Space/Shift on keyboard.</span>
            <button className="fly-hint__exit" onClick={() => setFlyMode(false)}>
              Exit fly mode
            </button>
          </div>
          <FlyDPad />
        </>
      )}
    </div>
  )
}
