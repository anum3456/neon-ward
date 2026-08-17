import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WAVE_SPEED } from '../utils/awake.js'

const SIGNS = [
  { position: [-1.9, 1.6, 1.3], rotation: [0, 0.4, 0], color: '#ff2ec4', shape: 'bars', scale: 1 },
  { position: [2.1, 1.1, -1.6], rotation: [0, -0.6, 0], color: '#00f0ff', shape: 'ring', scale: 0.9 },
  { position: [-2.6, 0.85, -1.1], rotation: [0, 1.1, 0], color: '#ffd23f', shape: 'bars', scale: 0.8 },
  { position: [1.4, 2.1, 1.9], rotation: [0, -0.2, 0], color: '#7b5cff', shape: 'ring', scale: 1.1 },
  { position: [0.6, 0.7, -2.3], rotation: [0, 0.9, 0], color: '#39ff9e', shape: 'bars', scale: 0.7 },
  { position: [-0.9, 1.9, 2.4], rotation: [0, -1.3, 0], color: '#ff5b3d', shape: 'ring', scale: 0.75 },
].map((s) => ({ ...s, dist: Math.hypot(s.position[0], s.position[2]) }))

function BarSign({ color, seed, awakeAtRef, dist }) {
  const bars = useMemo(() => new Array(4).fill(0).map((_, i) => ({ h: 0.14 + Math.random() * 0.22, x: (i - 1.5) * 0.09 })), [])
  const refs = useRef([])

  useFrame((state) => {
    const awakeAt = awakeAtRef?.current
    const waveArrived = awakeAt != null && (performance.now() - awakeAt) / 1000 > dist / WAVE_SPEED
    bars.forEach((b, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      const flicker = waveArrived ? 1 : Math.sin(state.clock.elapsedTime * 4 + seed + i) > -0.7 ? 1 : 0.15
      mesh.material.emissiveIntensity = flicker * (waveArrived ? 2.2 : 1.6)
    })
  })

  return (
    <group>
      {bars.map((b, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[b.x, b.h / 2, 0]}>
          <boxGeometry args={[0.045, b.h, 0.03]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function RingSign({ color, seed, awakeAtRef, dist }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const awakeAt = awakeAtRef?.current
    const waveArrived = awakeAt != null && (performance.now() - awakeAt) / 1000 > dist / WAVE_SPEED
    const flicker = waveArrived ? 1 : Math.sin(state.clock.elapsedTime * 3.2 + seed) > -0.75 ? 1 : 0.2
    ref.current.material.emissiveIntensity = flicker * (waveArrived ? 2.1 : 1.5)
    ref.current.rotation.z = state.clock.elapsedTime * (waveArrived ? 0.35 : 0.15)
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.16, 0.018, 10, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
    </mesh>
  )
}

function Sign({ position, rotation, color, shape, scale, dist, awakeAtRef }) {
  const seed = useMemo(() => Math.random() * 10, [])
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {shape === 'bars' ? (
        <BarSign color={color} seed={seed} awakeAtRef={awakeAtRef} dist={dist} />
      ) : (
        <RingSign color={color} seed={seed} awakeAtRef={awakeAtRef} dist={dist} />
      )}
      <pointLight color={color} intensity={0.5} distance={1.4} />
    </group>
  )
}

export default function NeonSigns({ awakeAtRef }) {
  return (
    <group>
      {SIGNS.map((s, i) => (
        <Sign key={i} {...s} awakeAtRef={awakeAtRef} />
      ))}
    </group>
  )
}
