import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore, useTheme } from '../store'
import Ark from './Ark'
import Ocean from './Ocean'
import IslandCluster from './IslandCluster'
import Seagulls from './Seagulls'
import SeaLife from './SeaLife'
import SkyDome from './SkyDome'
import CartoonClouds from './CartoonClouds'

function SceneContents() {
  const t = useTheme()
  const l = t.lighting

  return (
    <>
      <color attach="background" args={[t.scene.background]} />
      <fog attach="fog" args={[t.scene.fogColor, t.scene.fogNear, t.scene.fogFar]} />

      <ambientLight intensity={l.ambient.intensity} color={l.ambient.color} />
      <directionalLight position={l.main.position} intensity={l.main.intensity} color={l.main.color} castShadow />
      <directionalLight position={l.fill.position} intensity={l.fill.intensity} color={l.fill.color} />
      <hemisphereLight args={[l.hemisphere.sky, l.hemisphere.ground, l.hemisphere.intensity]} />

      <SkyDome />
      <CartoonClouds />
      <Ocean />
      <Ark />
      <IslandCluster />
      <Seagulls />
      <SeaLife />
      <OrbitControls minZoom={22} maxZoom={60} enablePan={false} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.5} />
    </>
  )
}

export default function Scene() {
  const setLoaded = useStore((s) => s.setLoaded)

  return (
    <Canvas
      onCreated={() => setTimeout(() => setLoaded(true), 800)}
      orthographic
      camera={{ position: [10, 10, 10], zoom: 28, near: -100, far: 200 }}
    >
      <SceneContents />
    </Canvas>
  )
}
