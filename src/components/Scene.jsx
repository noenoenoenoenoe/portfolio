import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore } from '../store'
import Ark from './Ark'
import Ocean from './Ocean'
import IslandCluster from './IslandCluster'
import Seagulls from './Seagulls'
import SeaLife from './SeaLife'
import SkyDome from './SkyDome'
import CartoonClouds from './CartoonClouds'

export default function Scene() {
  const setLoaded = useStore((s) => s.setLoaded)

  return (
    <Canvas
      onCreated={() => setTimeout(() => setLoaded(true), 800)}
      orthographic
      camera={{
        position: [10, 10, 10],
        zoom: 28,
        near: -100,
        far: 200,
      }}
    >
      {/* Animal Crossing pastel sky */}
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#c8e6f5', 35, 90]} />
      <SkyDome />

      {/* Soft diffuse lighting — golden hour douce */}
      <ambientLight intensity={0.7} color="#fff5e6" />
      <directionalLight
        position={[8, 14, 5]}
        intensity={1.0}
        color="#fff8e8"
        castShadow
      />
      <directionalLight position={[-6, 8, -6]} intensity={0.35} color="#b8d4ff" />
      <hemisphereLight
        args={['#ffe8c0', '#a0d8a0', 0.4]}
      />

      <CartoonClouds />

      <Ark />
      <Ocean />
      <IslandCluster />
      <Seagulls />
      <SeaLife />
      <OrbitControls
        minZoom={22}
        maxZoom={60}
        enablePan={false}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  )
}
