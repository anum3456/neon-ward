import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PATHS = [
  { radius: 3.4, height: 1.4, speed: 0.18, color: '#00f0ff', tilt: 0 },
  { radius: 2.6, height: 2.1, speed: -0.24, color: '#ff2ec4', tilt: 0.15 },
  { radius: 4.1, height: 0.9, speed: 0.13, color: '#ffd23f', tilt: -0.1 },
  { radius: 3.0, height: 2.6, speed: -0.16, color: '#39ff9e', tilt: 0.08 },
]

const TRAIL_LEN = 10

function Vehicle({ radius, height, speed, color, tilt, phase }) {
  const headRef = useRef()
  const trailRef = useRef()
  const history = useRef(new Array(TRAIL_LEN).fill(0).map(() => new THREE.Vector3()))
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase
    const x = Math.cos(t) * radius
    const z = Math.sin(t) * radius
    const y = height + Math.sin(t * 3) * tilt

    if (headRef.current) {
      headRef.current.position.set(x, y, z)
      headRef.current.lookAt(Math.cos(t + 0.1) * radius, y, Math.sin(t + 0.1) * radius)
    }

    const hist = history.current
    hist.pop()
    hist.unshift(new THREE.Vector3(x, y, z))

    if (trailRef.current) {
      hist.forEach((v, i) => {
        dummy.position.copy(v)
        const s = (1 - i / TRAIL_LEN) * 0.5
        dummy.scale.setScalar(Math.max(0.001, s))
        dummy.updateMatrix()
        trailRef.current.setMatrixAt(i, dummy.matrix)
      })
      trailRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      <mesh ref={headRef}>
        <coneGeometry args={[0.035, 0.11, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <instancedMesh ref={trailRef} args={[null, null, TRAIL_LEN]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

export default function Vehicles() {
  return (
    <group>
      {PATHS.map((p, i) => (
        <Vehicle key={i} {...p} phase={i * 1.7} />
      ))}
    </group>
  )
}
