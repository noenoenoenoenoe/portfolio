import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Cloud } from '@react-three/drei'
import Ark from './Ark'
import Ocean from './Ocean'
import IslandCluster from './IslandCluster'
import Seagulls from './Seagulls'

export default function Scene() {
  return (
    <Canvas
      orthographic
      camera={{
        position: [10, 10, 10],
        zoom: 28,
        near: -100,
        far: 200,
      }}
    >
      {/* Warm cartoon sky background */}
      <color attach="background" args={['#1a8fb4']} />
      <fog attach="fog" args={['#b0d8f0', 30, 80]} />

      {/* Warm lighting — one strong sun + soft ambient */}
      <ambientLight intensity={0.5} color="#ffeedd" />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.3}
        color="#fff5e0"
        castShadow
      />
      <directionalLight position={[-5, 6, -8]} intensity={0.2} color="#a0c4ff" />

      {/* Clouds */}
      <Cloud position={[-15, 12, -10]} speed={0.2} opacity={0.4} width={8} depth={2} />
      <Cloud position={[12, 14, 8]} speed={0.15} opacity={0.3} width={10} depth={2} />
      <Cloud position={[0, 13, -15]} speed={0.25} opacity={0.35} width={6} depth={2} />

      <Ark />
      <Ocean />
      <IslandCluster />
      <Seagulls />
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
