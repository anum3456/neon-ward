import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WAVE_SPEED } from '../utils/awake.js'

const NEON = ['#00f0ff', '#ff2ec4', '#ffd23f', '#7b5cff', '#39ff9e', '#ff5b3d']

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function WindowLights({ width, height, depth, color, rand, dist, awakeAtRef }) {
  // instanced lit windows on the two long faces of a tower
  const cols = Math.max(2, Math.round(width * 2.2))
  const rows = Math.max(3, Math.round(height * 1.8))
  const count = cols * rows * 2
  const meshRef = useRef()
  const litMask = useMemo(() => new Array(count).fill(0).map(() => rand() > 0.42), [count, rand])
  const wakeMask = useMemo(() => new Array(count).fill(0).map(() => rand() > 0.08), [count, rand])
  const flickerSeeds = useMemo(() => new Array(count).fill(0).map(() => rand() * 10), [count, rand])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!meshRef.current) return
    const awakeAt = awakeAtRef.current
    const waveArrived = awakeAt !== null && (performance.now() - awakeAt) / 1000 > dist / WAVE_SPEED
    let i = 0
    const gapX = width / cols
    const gapY = height / rows
    for (let face = 0; face < 2; face++) {
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = -width / 2 + gapX * (c + 0.5)
          const y = -height / 2 + gapY * (r + 0.5)
          const z = face === 0 ? depth / 2 + 0.01 : -depth / 2 - 0.01
          dummy.position.set(x, y, z)
          dummy.rotation.set(0, face === 0 ? 0 : Math.PI, 0)
          const lit = waveArrived
            ? wakeMask[i]
            : litMask[i] && Math.sin(state.clock.elapsedTime * 3 + flickerSeeds[i]) > -0.85
          dummy.scale.setScalar(lit ? 1 : 0.001)
          dummy.updateMatrix()
          meshRef.current.setMatrixAt(i, dummy.matrix)
          i++
        }
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <planeGeometry args={[0.09, 0.13]} />
      <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function Tower({ position, width, depth, height, neonColor, rand, dist, awakeAtRef }) {
  const trimRef = useRef()
  const lightRef = useRef()
  useFrame((state) => {
    const awakeAt = awakeAtRef.current
    const waveArrived = awakeAt !== null && (performance.now() - awakeAt) / 1000 > dist / WAVE_SPEED
    const justArrived = waveArrived && (performance.now() - awakeAt) / 1000 - dist / WAVE_SPEED < 0.4
    if (trimRef.current) {
      const basePulse = 0.7 + Math.sin(state.clock.elapsedTime * 1.2 + position[0]) * 0.3
      trimRef.current.material.emissiveIntensity = waveArrived ? (justArrived ? 3.2 : 1.7) : basePulse
    }
    if (lightRef.current) {
      lightRef.current.intensity = waveArrived ? 1.1 : 0.6
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#0d0e1a" roughness={0.6} metalness={0.35} />
      </mesh>

      {/* glowing roofline trim */}
      <mesh ref={trimRef} position={[0, height + 0.015, 0]}>
        <boxGeometry args={[width + 0.03, 0.03, depth + 0.03]} />
        <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>

      <group position={[0, height / 2, 0]}>
        <WindowLights width={width} height={height} depth={depth} color={neonColor} rand={rand} dist={dist} awakeAtRef={awakeAtRef} />
      </group>

      <pointLight ref={lightRef} position={[0, height + 0.4, 0]} color={neonColor} intensity={0.6} distance={2.4} />
    </group>
  )
}

export default function Buildings({ awakeAtRef }) {
  const towers = useMemo(() => {
    const rand = seededRandom(918273)
    const list = []
    const gridSize = 6
    const spacing = 1.35
    let idx = 0
    for (let gx = -gridSize; gx <= gridSize; gx++) {
      for (let gz = -gridSize; gz <= gridSize; gz++) {
        // keep a clear street cross through the middle for the vehicle paths / camera
        if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1) continue
        if (rand() > 0.72) continue
        const jitterX = (rand() - 0.5) * 0.35
        const jitterZ = (rand() - 0.5) * 0.35
        const dist = Math.sqrt(gx * gx + gz * gz)
        const height = Math.max(0.5, (rand() * 2.6 + 0.6) * (1 - dist / (gridSize * 1.6) + 0.4))
        const width = 0.5 + rand() * 0.35
        const depth = 0.5 + rand() * 0.35
        list.push({
          key: idx++,
          position: [gx * spacing + jitterX, 0, gz * spacing + jitterZ],
          width,
          depth,
          height,
          neonColor: NEON[Math.floor(rand() * NEON.length)],
          rand,
          dist: dist * spacing,
        })
      }
    }
    return list
  }, [])

  return (
    <group>
      {towers.map((t) => (
        <Tower key={t.key} {...t} awakeAtRef={awakeAtRef} />
      ))}
    </group>
  )
}
