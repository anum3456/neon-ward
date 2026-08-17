import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'

const SPEED = 4.2
const tmpDir = new THREE.Vector3()
const tmpRight = new THREE.Vector3()
const tmpMove = new THREE.Vector3()

// Shared, mutable key state — both the keyboard listener below and the
// on-screen touch D-pad (FlyDPad.jsx) write into this same object, so
// either input method drives the same movement logic.
export const flyKeys = {}

export default function FlyControls({ active, onExit }) {
  const { camera } = useThree()

  useEffect(() => {
    if (!active) return
    const down = (e) => {
      flyKeys[e.code] = true
    }
    const up = (e) => {
      flyKeys[e.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      Object.keys(flyKeys).forEach((k) => delete flyKeys[k])
    }
  }, [active])

  useFrame((state, delta) => {
    if (!active) return
    const k = flyKeys
    camera.getWorldDirection(tmpDir)
    tmpRight.crossVectors(tmpDir, camera.up).normalize()
    tmpMove.set(0, 0, 0)
    if (k['KeyW'] || k['ArrowUp']) tmpMove.add(tmpDir)
    if (k['KeyS'] || k['ArrowDown']) tmpMove.sub(tmpDir)
    if (k['KeyD'] || k['ArrowRight']) tmpMove.add(tmpRight)
    if (k['KeyA'] || k['ArrowLeft']) tmpMove.sub(tmpRight)
    if (k['Space']) tmpMove.y += 1
    if (k['ShiftLeft'] || k['ShiftRight']) tmpMove.y -= 1
    if (tmpMove.lengthSq() > 0) {
      tmpMove.normalize().multiplyScalar(SPEED * delta * (k['KeyE'] ? 2.2 : 1))
      camera.position.add(tmpMove)
    }
  })

  if (!active) return null

  return <PointerLockControls onUnlock={() => onExit && onExit()} />
}
