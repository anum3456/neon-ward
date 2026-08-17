import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 260
const SPAN = 9

export function GroundGrid() {
  const gridRef = useRef()
  const linesGeo = useMemo(() => {
    const positions = []
    const step = 0.45
    for (let i = -10; i <= 10; i++) {
      positions.push(-SPAN, 0, i * step, SPAN, 0, i * step)
      positions.push(i * step, 0, -SPAN, i * step, 0, SPAN)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame((state) => {
    if (!gridRef.current) return
    gridRef.current.material.opacity = 0.16 + Math.sin(state.clock.elapsedTime * 0.6) * 0.04
  })

  return (
    <group>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SPAN * 2, SPAN * 2]} />
        <meshStandardMaterial color="#04040a" roughness={0.15} metalness={0.7} />
      </mesh>
      <lineSegments ref={gridRef} geometry={linesGeo}>
        <lineBasicMaterial color="#3ef2ff" transparent opacity={0.16} />
      </lineSegments>
    </group>
  )
}

export default function Rain() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const drops = useMemo(
    () =>
      new Array(COUNT).fill(0).map(() => ({
        x: (Math.random() - 0.5) * SPAN * 2,
        z: (Math.random() - 0.5) * SPAN * 2,
        y: Math.random() * 5,
        speed: 3.5 + Math.random() * 2.5,
      })),
    []
  )

  useFrame((state, delta) => {
    if (!meshRef.current) return
    drops.forEach((d, i) => {
      d.y -= d.speed * delta
      if (d.y < 0) d.y = 5
      dummy.position.set(d.x, d.y, d.z)
      dummy.rotation.x = Math.PI / 2.3
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <cylinderGeometry args={[0.002, 0.002, 0.22, 3]} />
      <meshBasicMaterial color="#bcd8ff" transparent opacity={0.35} toneMapped={false} />
    </instancedMesh>
  )
}
