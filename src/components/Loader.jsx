import { useProgress } from '@react-three/drei'

export default function Loader() {
  const { progress } = useProgress()
  return (
    <div className="loader">
      <div className="loader__title">Driftlight</div>
      <div className="loader__bar">
        <div className="loader__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
