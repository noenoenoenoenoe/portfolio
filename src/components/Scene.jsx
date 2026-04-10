import { Canvas } from '@react-three/fiber'
import { OrbitControls, Cloud } from '@react-three/drei'
import { useStore } from '../store'
import Ark from './Ark'
import Ocean from './Ocean'
import IslandCluster from './IslandCluster'
import Seagulls from './Seagulls'
import SeaLife from './SeaLife'
import SkyDome from './SkyDome'

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

      {/* Fluffy rounded clouds */}
      <Cloud position={[-16, 10, -12]} speed={0.15} opacity={0.7} width={10} depth={3} segments={12} />
      <Cloud position={[14, 12, 10]} speed={0.1} opacity={0.6} width={12} depth={3} segments={14} />
      <Cloud position={[0, 11, -18]} speed={0.18} opacity={0.65} width={8} depth={3} segments={10} />
      <Cloud position={[-8, 13, 15]} speed={0.12} opacity={0.5} width={9} depth={2.5} segments={11} />
      <Cloud position={[20, 11, -5]} speed={0.08} opacity={0.55} width={11} depth={3} segments={13} />

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
