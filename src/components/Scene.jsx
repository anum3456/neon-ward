import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import Buildings from './Buildings.jsx'
import NeonSigns from './NeonSigns.jsx'
import Vehicles from './Vehicles.jsx'
import Rain, { GroundGrid } from './Rain.jsx'
import Drones from './Drones.jsx'
import FlyControls from './FlyControls.jsx'
import KoiPond from './KoiPond.jsx'

const WAYPOINT_VIEWS = {
  street: { pos: [0, 0.9, 3.4], target: [0, 0.8, 0] },
  skyline: { pos: [0, 4.2, 5.5], target: [0, 1.4, 0] },
  overhead: { pos: [0.2, 7, 0.4], target: [0, 0, 0] },
  pond: { pos: [0.9, 1.1, 1.1], target: [0, 0.3, 0] },
}

function FogReveal({ koiSolved }) {
  const { scene } = useThree()
  useFrame((state, delta) => {
    if (!scene.fog) return
    const targetFar = koiSolved ? 20 : 14
    scene.fog.far = THREE.MathUtils.damp(scene.fog.far, targetFar, 1.2, delta)
  })
  return null
}

export default function Scene({
  onFirstInteract,
  waypoint,
  flyMode,
  onExitFly,
  onKoiProgress,
  onKoiSolved,
  koiSolved,
  koiResetSignal,
  awakeAtRef,
}) {
  const controlsRef = useRef()
  const { camera } = useThree()
  const interactedRef = useRef(false)

  const handleInteract = () => {
    if (!interactedRef.current) {
      interactedRef.current = true
      onFirstInteract && onFirstInteract()
    }
  }

  useEffect(() => {
    if (!waypoint) return
    const view = WAYPOINT_VIEWS[waypoint.key]
    if (!view || !controlsRef.current) return
    controlsRef.current.autoRotate = false
    gsap.to(camera.position, { x: view.pos[0], y: view.pos[1], z: view.pos[2], duration: 1.8, ease: 'power2.inOut' })
    gsap.to(controlsRef.current.target, {
      x: view.target[0],
      y: view.target[1],
      z: view.target[2],
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => controlsRef.current.update(),
    })
  }, [waypoint, camera])

  return (
    <>
      <fog attach="fog" args={['#0a0916', 4, 14]} />
      <color attach="background" args={['#050510']} />

      <ambientLight intensity={koiSolved ? 0.42 : 0.28} color="#3a2f6b" />
      <directionalLight position={[3, 6, 2]} intensity={0.35} color="#7d8fff" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#ff2ec4" distance={8} />

      <GroundGrid />
      <FogReveal koiSolved={koiSolved} />

      <group onPointerDown={handleInteract}>
        <Buildings awakeAtRef={awakeAtRef} />
        <NeonSigns awakeAtRef={awakeAtRef} />
      </group>

      <Vehicles />
      <Rain />
      <Drones />
      <KoiPond onProgress={onKoiProgress} onSolved={onKoiSolved} resetSignal={koiResetSignal} />

      {!flyMode && (
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1.8}
          maxDistance={9}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate
          autoRotateSpeed={0.22}
          onStart={handleInteract}
          target={[0, 0.9, 0]}
        />
      )}
      <FlyControls active={flyMode} onExit={onExitFly} />

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={koiSolved ? 1.8 : 1.3}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.3}
        />
        <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} />
        <Vignette eskil={false} offset={0.15} darkness={0.9} />
      </EffectComposer>
    </>
  )
}
