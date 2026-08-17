import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playChime, playBuzz } from '../utils/audio.js'

const KOI = [
  { id: 'cyan', color: '#00f0ff', freq: 660, radius: 0.34, speed: 0.5, phase: 0 },
  { id: 'magenta', color: '#ff2ec4', freq: 740, radius: 0.4, speed: -0.4, phase: 1.6 },
  { id: 'gold', color: '#ffd23f', freq: 830, radius: 0.28, speed: 0.65, phase: 3.1 },
  { id: 'mint', color: '#39ff9e', freq: 920, freqAlt: true, radius: 0.36, speed: -0.55, phase: 4.4 },
]

const POND_POSITION = [0, 0, 0]
const SEQUENCE_LENGTH = 3

function makeSequence() {
  const ids = KOI.map((k) => k.id)
  const seq = []
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    seq.push(ids[Math.floor(Math.random() * ids.length)])
  }
  return seq
}

function Koi({ id, color, freq, radius, speed, phase, highlight, onClick }) {
  const ref = useRef()
  const finRef = useRef()
  const pulse = useRef(0)

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed + phase
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.z = Math.sin(t) * radius
    ref.current.position.y = 0.015 + Math.sin(t * 4) * 0.006
    ref.current.rotation.y = -t - Math.PI / 2

    pulse.current = THREE.MathUtils.damp(pulse.current, highlight ? 1 : 0, 6, delta)
    if (finRef.current) {
      finRef.current.material.emissiveIntensity = 1.1 + pulse.current * 2.2
    }
    ref.current.scale.setScalar(1 + pulse.current * 0.35)
  })

  return (
    <group
      ref={ref}
      onPointerDown={(e) => {
        e.stopPropagation()
        onClick(id)
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <mesh ref={finRef} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.045, 0.14, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={0.35} distance={0.6} />
      {/* generous invisible hit target */}
      <mesh visible={false}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

function Pylon({ activeColor }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.5
    ref.current.material.emissiveIntensity = activeColor ? pulse * 1.8 : 0.4
  })
  return (
    <mesh ref={ref} position={[0, 0.35, -0.55]}>
      <cylinderGeometry args={[0.03, 0.05, 0.7, 6]} />
      <meshStandardMaterial
        color={activeColor || '#4a4a6a'}
        emissive={activeColor || '#4a4a6a'}
        emissiveIntensity={0.4}
        toneMapped={false}
      />
    </mesh>
  )
}

function PondSurface({ solved, denied }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.material.opacity = solved ? 0.85 : 0.65
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
      <circleGeometry args={[0.62, 40]} />
      <meshStandardMaterial
        color={denied ? '#3a0a12' : '#050a14'}
        metalness={0.85}
        roughness={0.1}
        transparent
        opacity={0.65}
      />
    </mesh>
  )
}

function LightFountain({ active }) {
  const groupRef = useRef()
  const opacity = useRef(0)
  useFrame((state, delta) => {
    opacity.current = THREE.MathUtils.damp(opacity.current, active ? 1 : 0, 3, delta)
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, i) => {
        mesh.material.opacity = opacity.current * 0.5
        mesh.rotation.y = state.clock.elapsedTime * (0.3 + i * 0.1) * (i % 2 === 0 ? 1 : -1)
      })
    }
  })
  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      {[0.3, 0.45, 0.58].map((r, i) => (
        <mesh key={i}>
          <torusGeometry args={[r, 0.012, 8, 40]} />
          <meshBasicMaterial
            color={i === 0 ? '#00f0ff' : i === 1 ? '#ff2ec4' : '#ffd23f'}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function KoiPond({ onSolved, onProgress, resetSignal }) {
  const [sequence, setSequence] = useState(() => makeSequence())
  const [progress, setProgress] = useState(0)
  const [solved, setSolved] = useState(false)
  const [flashId, setFlashId] = useState(null)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    onProgress && onProgress({ sequence, progress: 0, solved: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence])

  useEffect(() => {
    if (resetSignal === undefined) return
    const next = makeSequence()
    setSequence(next)
    setProgress(0)
    setSolved(false)
  }, [resetSignal])

  const handleKoiClick = useCallback(
    (id) => {
      if (solved) return
      setFlashId(id)
      setTimeout(() => setFlashId(null), 250)
      if (id === sequence[progress]) {
        const next = progress + 1
        playChime(500 + next * 160)
        setProgress(next)
        onProgress && onProgress({ sequence, progress: next, solved: next >= sequence.length })
        if (next >= sequence.length) {
          setSolved(true)
          onSolved && onSolved()
        }
      } else {
        playBuzz()
        setProgress(0)
        onProgress && onProgress({ sequence, progress: 0, solved: false })
        setDenied(true)
        setTimeout(() => setDenied(false), 260)
      }
    },
    [sequence, progress, solved, onSolved, onProgress]
  )

  return (
    <group position={POND_POSITION}>
      <PondSurface solved={solved} denied={denied} />
      <Pylon activeColor={solved ? '#ffffff' : null} />
      <LightFountain active={solved} />
      {KOI.map((k) => (
        <Koi key={k.id} {...k} highlight={flashId === k.id} onClick={handleKoiClick} />
      ))}
    </group>
  )
}

export { KOI, SEQUENCE_LENGTH }
