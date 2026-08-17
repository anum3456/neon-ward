import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playChime } from '../utils/audio.js'

const LAUNCH_POINT = new THREE.Vector3(0, 0.15, 0)
const LIFETIME = 6

function Drone({ id, birth, driftSeed, color, onDone }) {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    const age = state.clock.elapsedTime - birth
    if (age > LIFETIME) {
      onDone(id)
      return
    }
    const t = age / LIFETIME
    ref.current.position.y = LAUNCH_POINT.y + age * 0.65
    ref.current.position.x = LAUNCH_POINT.x + Math.sin(age * 1.4 + driftSeed) * 0.5
    ref.current.position.z = LAUNCH_POINT.z + Math.cos(age * 1.1 + driftSeed) * 0.5
    ref.current.rotation.y = age * 2
    const fade = t < 0.1 ? t / 0.1 : t > 0.8 ? 1 - (t - 0.8) / 0.2 : 1
    ref.current.material.emissiveIntensity = 1.8 * fade
    ref.current.material.opacity = fade
  })

  return (
    <mesh ref={ref} position={LAUNCH_POINT.toArray()}>
      <octahedronGeometry args={[0.045, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0} transparent opacity={0} toneMapped={false} />
    </mesh>
  )
}

const COLORS = ['#00f0ff', '#ff2ec4', '#ffd23f', '#39ff9e']

export default function Drones() {
  const [drones, setDrones] = useState([])
  const idRef = useRef(0)
  const clock = useRef(0)

  useFrame((state) => {
    clock.current = state.clock.elapsedTime
  })

  const spawn = useCallback((point) => {
    idRef.current += 1
    const id = idRef.current
    setDrones((prev) => [
      ...prev.slice(-9),
      {
        id,
        birth: clock.current,
        driftSeed: Math.random() * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      },
    ])
    playChime(700 + Math.random() * 260)
  }, [])

  const remove = useCallback((id) => {
    setDrones((prev) => prev.filter((d) => d.id !== id))
  }, [])

  return (
    <group>
      {/* invisible catcher so clicking open sky launches a drone */}
      <mesh
        position={[0, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          spawn()
        }}
      >
        <sphereGeometry args={[16, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {drones.map((d) => (
        <Drone key={d.id} {...d} onDone={remove} />
      ))}
    </group>
  )
}
