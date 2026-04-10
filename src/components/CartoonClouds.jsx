import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTheme } from '../store'

// Pokemon: round cartoon puffs (7 spheres)
const cartoonPuffs = [
  { pos: [0, 0, 0], r: 1.2, accent: false },
  { pos: [-1.0, -0.1, 0.2], r: 1.0, accent: false },
  { pos: [1.1, -0.15, -0.1], r: 0.95, accent: false },
  { pos: [0.5, 0.4, 0.1], r: 0.8, accent: false },
  { pos: [-0.5, 0.35, -0.15], r: 0.75, accent: false },
  { pos: [-1.6, -0.3, 0], r: 0.65, accent: true },
  { pos: [1.7, -0.25, 0.15], r: 0.7, accent: true },
]

// Ghibli: MASSIVE detailed cumulus — many overlapping puffs, towering
const ghibliPuffs = [
  // Core mass
  { pos: [0, 0, 0], r: 1.8, accent: false },
  { pos: [-0.8, 0.3, 0.3], r: 1.5, accent: false },
  { pos: [0.9, 0.2, -0.2], r: 1.4, accent: false },
  { pos: [0.2, 0.9, 0.1], r: 1.3, accent: false },
  // Towering top
  { pos: [-0.3, 1.5, 0], r: 1.1, accent: false },
  { pos: [0.4, 1.8, 0.2], r: 0.9, accent: false },
  { pos: [-0.1, 2.2, -0.1], r: 0.7, accent: false },
  // Wide base
  { pos: [-1.8, -0.3, 0.4], r: 1.2, accent: false },
  { pos: [1.6, -0.25, -0.3], r: 1.1, accent: false },
  { pos: [-2.4, -0.4, 0.1], r: 0.9, accent: true },
  { pos: [2.3, -0.3, 0.2], r: 0.85, accent: true },
  // Extra volume
  { pos: [0, -0.5, 0.5], r: 1.3, accent: true },
  { pos: [-1.2, 0.8, -0.3], r: 1.0, accent: false },
  { pos: [1.0, 1.2, 0.3], r: 0.85, accent: false },
]

// Realistic: flatter, wider, fewer puffs, wispy feel
const realisticPuffs = [
  { pos: [0, 0, 0], r: 1.4, accent: false },
  { pos: [-1.4, -0.05, 0.3], r: 1.2, accent: false },
  { pos: [1.3, -0.08, -0.2], r: 1.15, accent: false },
  { pos: [-2.5, -0.1, 0.1], r: 0.9, accent: true },
  { pos: [2.4, -0.1, 0.2], r: 0.85, accent: true },
  { pos: [0.3, 0.15, 0.15], r: 1.0, accent: false },
]

const puffSets = { cartoon: cartoonPuffs, ghibli: ghibliPuffs, realistic: realisticPuffs }

function Cloud({ position, scale = 1, speed = 0.1 }) {
  const groupRef = useRef()
  const theme = useTheme()
  const c = theme.clouds
  const startX = position[0]
  const toon = theme.useToonShading
  const puffs = puffSets[c.puffs] || cartoonPuffs
  const finalScale = scale * c.scale

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.x = startX + Math.sin(clock.getElapsedTime() * speed * c.speed) * 2
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * speed * c.speed * 0.7 + 1) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={position} scale={finalScale}>
      {puffs.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[p.r, 12, 10]} />
          {toon
            ? <meshToonMaterial
                color={p.accent ? c.accent : c.main}
                transparent={c.opacity < 1}
                opacity={c.opacity}
              />
            : <meshStandardMaterial
                color={p.accent ? c.accent : c.main}
                roughness={1}
                transparent={c.opacity < 1}
                opacity={c.opacity}
              />
          }
        </mesh>
      ))}
    </group>
  )
}

export default function CartoonClouds() {
  return (
    <group>
      <Cloud position={[-16, 10, -12]} scale={1.2} speed={0.08} />
      <Cloud position={[14, 12, 10]} scale={1.5} speed={0.06} />
      <Cloud position={[0, 11, -20]} scale={1.0} speed={0.1} />
      <Cloud position={[-8, 13, 16]} scale={0.9} speed={0.07} />
      <Cloud position={[22, 11, -5]} scale={1.3} speed={0.05} />
      <Cloud position={[-25, 12, 8]} scale={0.8} speed={0.09} />
      <Cloud position={[8, 14, -15]} scale={0.7} speed={0.11} />
    </group>
  )
}
