import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { islands } from '../data/islands'

// Cute fish swimming in circles
function Fish({ offset = 0, radius = 8, depth = -0.6, speed = 0.3, color = '#ff8844', size = 0.12 }) {
  const groupRef = useRef()
  const tailRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset
    groupRef.current.position.x = Math.sin(t) * radius
    groupRef.current.position.z = Math.cos(t) * radius
    groupRef.current.position.y = depth + Math.sin(t * 2) * 0.1
    groupRef.current.rotation.y = t + Math.PI / 2

    // Tail wiggle
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 8 + offset * 5) * 0.4
    }
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[size, 8, 6]} />
        <meshToonMaterial color={color} />
        <Outlines thickness={0.006} color="#333" />
      </mesh>
      {/* Eye */}
      <mesh position={[size * 0.6, size * 0.3, size * 0.5]}>
        <sphereGeometry args={[size * 0.18, 6, 6]} />
        <meshToonMaterial color="#fff" />
      </mesh>
      <mesh position={[size * 0.7, size * 0.3, size * 0.55]}>
        <sphereGeometry args={[size * 0.1, 6, 6]} />
        <meshToonMaterial color="#222" />
      </mesh>
      <mesh position={[size * 0.6, size * 0.3, -size * 0.5]}>
        <sphereGeometry args={[size * 0.18, 6, 6]} />
        <meshToonMaterial color="#fff" />
      </mesh>
      <mesh position={[size * 0.7, size * 0.3, -size * 0.55]}>
        <sphereGeometry args={[size * 0.1, 6, 6]} />
        <meshToonMaterial color="#222" />
      </mesh>
      {/* Tail */}
      <group ref={tailRef} position={[-size * 0.9, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[size * 0.6, size * 0.05, size * 0.5]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[size * 0.6, size * 0.05, size * 0.5]} />
          <meshToonMaterial color={color} />
        </mesh>
      </group>
      {/* Dorsal fin */}
      <mesh position={[0, size * 0.7, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[size * 0.15, size * 0.4, 4]} />
        <meshToonMaterial color={color} />
      </mesh>
    </group>
  )
}

// Check if a position is too close to any island
const islandSafeRadius = 6
function isNearIsland(x, z) {
  for (const island of islands) {
    const dx = x - island.position[0]
    const dz = z - island.position[2]
    const r = island.scale || 1.0
    if (dx * dx + dz * dz < (islandSafeRadius * r) * (islandSafeRadius * r)) return true
  }
  return false
}

// Dolphin — sleek curved body, proper jump arc, avoids islands
function Dolphin({ offset = 0, centerX = 0, centerZ = 0, arcRadius = 3, speed = 0.4 }) {
  const groupRef = useRef()
  const tailRef = useRef()

  // Precompute a safe path — shift center if it overlaps islands
  const safeCenter = useMemo(() => {
    let cx = centerX, cz = centerZ
    // Check 8 points on the circle and shift if any hit an island
    for (let attempt = 0; attempt < 5; attempt++) {
      let safe = true
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        if (isNearIsland(cx + Math.sin(a) * arcRadius, cz + Math.cos(a) * arcRadius)) {
          safe = false
          break
        }
      }
      if (safe) break
      cx += 8
      cz += 5
    }
    return [cx, cz]
  }, [centerX, centerZ, arcRadius])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset
    const pathAngle = t * 0.25

    // Jump cycle: underwater cruise → leap → splash down
    const jumpCycle = t % (Math.PI * 2)
    const jumpPhase = Math.max(0, Math.sin(jumpCycle))
    const jumpHeight = jumpPhase * jumpPhase * 2.0 // parabolic arc

    const x = safeCenter[0] + Math.sin(pathAngle) * arcRadius
    const z = safeCenter[1] + Math.cos(pathAngle) * arcRadius

    groupRef.current.position.x = x
    groupRef.current.position.z = z
    groupRef.current.position.y = -0.6 + jumpHeight

    // Face direction of travel
    groupRef.current.rotation.y = pathAngle + Math.PI / 2
    // Tilt nose up when rising, down when falling
    const tiltPhase = Math.cos(jumpCycle)
    groupRef.current.rotation.z = jumpPhase > 0.05 ? tiltPhase * 0.8 : 0

    // Hide when deep underwater
    groupRef.current.visible = jumpHeight > -0.3

    // Tail flick
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 6 + offset) * 0.3
    }
  })

  const dark = '#4a7a9a'
  const main = '#5a8ab0'
  const light = '#88b8d8'
  const belly = '#b0d8e8'
  const accent = '#6898b8'

  return (
    <group ref={groupRef} scale={1.3}>
      {/* Main body — elongated ellipsoid */}
      <mesh scale={[1.4, 0.7, 0.65]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshToonMaterial color={main} />
        <Outlines thickness={0.008} color={dark} />
      </mesh>

      {/* Head / melon — smooth bulge */}
      <mesh position={[0.22, 0.03, 0]} scale={[1.0, 0.8, 0.7]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshToonMaterial color={main} />
      </mesh>

      {/* Rostrum / beak — long pointed snout */}
      <mesh position={[0.35, -0.01, 0]} rotation={[0, 0, -0.05]} scale={[1, 0.5, 0.5]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshToonMaterial color={accent} />
      </mesh>
      <mesh position={[0.4, -0.02, 0]} rotation={[0, 0, 0.1]} scale={[1.5, 0.4, 0.4]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshToonMaterial color={accent} />
      </mesh>

      {/* Belly — lighter underside */}
      <mesh position={[0.02, -0.06, 0]} scale={[1.3, 0.45, 0.55]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshToonMaterial color={belly} />
      </mesh>

      {/* Light streaks/highlights on body */}
      <mesh position={[0.08, 0.06, 0.08]} scale={[1.5, 0.2, 0.3]} rotation={[0, 0, -0.1]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshToonMaterial color={light} />
      </mesh>
      <mesh position={[-0.05, 0.04, 0.09]} scale={[1.0, 0.15, 0.2]} rotation={[0, 0, -0.05]}>
        <sphereGeometry args={[0.03, 6, 4]} />
        <meshToonMaterial color={light} />
      </mesh>
      <mesh position={[0.08, 0.06, -0.08]} scale={[1.5, 0.2, 0.3]} rotation={[0, 0, -0.1]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshToonMaterial color={light} />
      </mesh>

      {/* Dorsal fin — tall, curved back */}
      <mesh position={[-0.04, 0.15, 0]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.035, 0.14, 4]} />
        <meshToonMaterial color={dark} />
      </mesh>

      {/* Pectoral fins — swept back */}
      <mesh position={[0.08, -0.08, 0.1]} rotation={[0.6, 0.3, -0.4]} scale={[1.3, 0.15, 1]}>
        <boxGeometry args={[0.08, 0.01, 0.05]} />
        <meshToonMaterial color={accent} />
      </mesh>
      <mesh position={[0.08, -0.08, -0.1]} rotation={[-0.6, -0.3, -0.4]} scale={[1.3, 0.15, 1]}>
        <boxGeometry args={[0.08, 0.01, 0.05]} />
        <meshToonMaterial color={accent} />
      </mesh>

      {/* Tail peduncle — narrowing */}
      <mesh position={[-0.28, 0.02, 0]} scale={[1.2, 0.4, 0.35]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshToonMaterial color={main} />
      </mesh>

      {/* Tail flukes — horizontal crescent */}
      <group ref={tailRef} position={[-0.35, 0.03, 0]}>
        <mesh position={[0, 0, 0.05]} rotation={[0.2, 0, 0.3]} scale={[1.2, 0.12, 1]}>
          <boxGeometry args={[0.06, 0.01, 0.07]} />
          <meshToonMaterial color={accent} />
        </mesh>
        <mesh position={[0, 0, -0.05]} rotation={[-0.2, 0, 0.3]} scale={[1.2, 0.12, 1]}>
          <boxGeometry args={[0.06, 0.01, 0.07]} />
          <meshToonMaterial color={accent} />
        </mesh>
      </group>

      {/* Eyes — small, placed correctly on the side */}
      <mesh position={[0.25, 0.03, 0.08]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshToonMaterial color="#1a2a3a" />
      </mesh>
      <mesh position={[0.25, 0.03, -0.08]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshToonMaterial color="#1a2a3a" />
      </mesh>

      {/* Mouth line */}
      <mesh position={[0.34, -0.025, 0]} rotation={[0, 0, 0.05]} scale={[2, 1, 0.3]}>
        <boxGeometry args={[0.04, 0.003, 0.002]} />
        <meshToonMaterial color={dark} />
      </mesh>
    </group>
  )
}

// Small school of fish near an island
function FishSchool({ center, seed = 0 }) {
  const fishData = useMemo(() => {
    const colors = ['#ff7744', '#ffaa33', '#44bbff', '#ff5588', '#88dd44', '#ffcc00', '#ff6699', '#55ccaa']
    return Array.from({ length: 4 }, (_, i) => ({
      offset: seed + i * 1.8,
      radius: 3 + (i % 3) * 1.5,
      depth: -0.5 - (i % 2) * 0.3,
      speed: 0.2 + (i % 3) * 0.08,
      color: colors[(seed + i) % colors.length],
      size: 0.08 + (i % 3) * 0.03,
    }))
  }, [seed])

  return (
    <group position={center}>
      {fishData.map((f, i) => (
        <Fish key={i} {...f} />
      ))}
    </group>
  )
}

export default function SeaLife() {
  return (
    <group>
      {/* Fish schools near islands */}
      <FishSchool center={[-3, 0, -8]} seed={0} />
      <FishSchool center={[5, 0, 12]} seed={5} />
      <FishSchool center={[20, 0, 20]} seed={10} />
      <FishSchool center={[-18, 0, -14]} seed={15} />

      {/* Scattered individual fish */}
      <Fish offset={3.0} radius={10} depth={-0.5} speed={0.25} color="#ff5566" size={0.1} />
      <Fish offset={5.5} radius={15} depth={-0.6} speed={0.18} color="#44cc88" size={0.14} />
      <Fish offset={1.2} radius={8} depth={-0.45} speed={0.3} color="#ffbb33" size={0.09} />

      {/* Dolphins jumping */}
      <Dolphin offset={0} centerX={8} centerZ={-3} arcRadius={6} speed={0.5} />
      <Dolphin offset={3.5} centerX={-10} centerZ={10} arcRadius={5} speed={0.45} />
      <Dolphin offset={1.8} centerX={15} centerZ={5} arcRadius={7} speed={0.4} />
    </group>
  )
}
