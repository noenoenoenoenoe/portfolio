import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { islands } from '../data/islands'
import { useTheme } from '../store'

function Fish({ offset = 0, radius = 8, depth = -0.6, speed = 0.3, color = '#ff8844', size = 0.12 }) {
  const groupRef = useRef()
  const tailRef = useRef()
  const theme = useTheme()
  const showOutline = theme.outlineThickness > 0 && theme.fish.outline !== 'none'

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset
    groupRef.current.position.x = Math.sin(t) * radius
    groupRef.current.position.z = Math.cos(t) * radius
    groupRef.current.position.y = depth + Math.sin(t * 2) * 0.1
    groupRef.current.rotation.y = t + Math.PI / 2

    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 8 + offset * 5) * 0.4
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[size, 8, 6]} />
        <meshToonMaterial color={color} />
        {showOutline && <Outlines thickness={0.006 * theme.outlineThickness} color={theme.fish.outline} />}
      </mesh>
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
      <mesh position={[0, size * 0.7, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[size * 0.15, size * 0.4, 4]} />
        <meshToonMaterial color={color} />
      </mesh>
    </group>
  )
}

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

function Dolphin({ offset = 0, centerX = 0, centerZ = 0, arcRadius = 3, speed = 0.4 }) {
  const groupRef = useRef()
  const tailRef = useRef()
  const theme = useTheme()
  const d = theme.dolphins
  const showOutline = theme.outlineThickness > 0

  const safeCenter = useMemo(() => {
    let cx = centerX, cz = centerZ
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
    const jumpCycle = t % (Math.PI * 2)
    const jumpPhase = Math.max(0, Math.sin(jumpCycle))
    const jumpHeight = jumpPhase * jumpPhase * 2.0

    const x = safeCenter[0] + Math.sin(pathAngle) * arcRadius
    const z = safeCenter[1] + Math.cos(pathAngle) * arcRadius

    groupRef.current.position.x = x
    groupRef.current.position.z = z
    groupRef.current.position.y = -0.6 + jumpHeight
    groupRef.current.rotation.y = pathAngle + Math.PI / 2
    const tiltPhase = Math.cos(jumpCycle)
    groupRef.current.rotation.z = jumpPhase > 0.05 ? tiltPhase * 0.8 : 0
    groupRef.current.visible = jumpHeight > -0.3

    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 6 + offset) * 0.3
    }
  })

  return (
    <group ref={groupRef} scale={1.3}>
      <mesh scale={[1.4, 0.7, 0.65]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshToonMaterial color={d.main} />
        {showOutline && <Outlines thickness={0.008 * theme.outlineThickness} color={d.dark} />}
      </mesh>
      <mesh position={[0.22, 0.03, 0]} scale={[1.0, 0.8, 0.7]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshToonMaterial color={d.main} />
      </mesh>
      <mesh position={[0.35, -0.01, 0]} rotation={[0, 0, -0.05]} scale={[1, 0.5, 0.5]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshToonMaterial color={d.accent} />
      </mesh>
      <mesh position={[0.4, -0.02, 0]} rotation={[0, 0, 0.1]} scale={[1.5, 0.4, 0.4]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshToonMaterial color={d.accent} />
      </mesh>
      <mesh position={[0.02, -0.06, 0]} scale={[1.3, 0.45, 0.55]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshToonMaterial color={d.belly} />
      </mesh>
      <mesh position={[0.08, 0.06, 0.08]} scale={[1.5, 0.2, 0.3]} rotation={[0, 0, -0.1]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshToonMaterial color={d.light} />
      </mesh>
      <mesh position={[-0.05, 0.04, 0.09]} scale={[1.0, 0.15, 0.2]} rotation={[0, 0, -0.05]}>
        <sphereGeometry args={[0.03, 6, 4]} />
        <meshToonMaterial color={d.light} />
      </mesh>
      <mesh position={[0.08, 0.06, -0.08]} scale={[1.5, 0.2, 0.3]} rotation={[0, 0, -0.1]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshToonMaterial color={d.light} />
      </mesh>
      <mesh position={[-0.04, 0.15, 0]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.035, 0.14, 4]} />
        <meshToonMaterial color={d.dark} />
      </mesh>
      <mesh position={[0.08, -0.08, 0.1]} rotation={[0.6, 0.3, -0.4]} scale={[1.3, 0.15, 1]}>
        <boxGeometry args={[0.08, 0.01, 0.05]} />
        <meshToonMaterial color={d.accent} />
      </mesh>
      <mesh position={[0.08, -0.08, -0.1]} rotation={[-0.6, -0.3, -0.4]} scale={[1.3, 0.15, 1]}>
        <boxGeometry args={[0.08, 0.01, 0.05]} />
        <meshToonMaterial color={d.accent} />
      </mesh>
      <mesh position={[-0.28, 0.02, 0]} scale={[1.2, 0.4, 0.35]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshToonMaterial color={d.main} />
      </mesh>
      <group ref={tailRef} position={[-0.35, 0.03, 0]}>
        <mesh position={[0, 0, 0.05]} rotation={[0.2, 0, 0.3]} scale={[1.2, 0.12, 1]}>
          <boxGeometry args={[0.06, 0.01, 0.07]} />
          <meshToonMaterial color={d.accent} />
        </mesh>
        <mesh position={[0, 0, -0.05]} rotation={[-0.2, 0, 0.3]} scale={[1.2, 0.12, 1]}>
          <boxGeometry args={[0.06, 0.01, 0.07]} />
          <meshToonMaterial color={d.accent} />
        </mesh>
      </group>
      <mesh position={[0.25, 0.03, 0.08]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshToonMaterial color={d.eyes} />
      </mesh>
      <mesh position={[0.25, 0.03, -0.08]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshToonMaterial color={d.eyes} />
      </mesh>
      <mesh position={[0.34, -0.025, 0]} rotation={[0, 0, 0.05]} scale={[2, 1, 0.3]}>
        <boxGeometry args={[0.04, 0.003, 0.002]} />
        <meshToonMaterial color={d.dark} />
      </mesh>
    </group>
  )
}

function FishSchool({ center, seed = 0 }) {
  const theme = useTheme()
  const fishColors = theme.fish.colors
  const fishData = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      offset: seed + i * 1.8,
      radius: 3 + (i % 3) * 1.5,
      depth: -0.5 - (i % 2) * 0.3,
      speed: 0.2 + (i % 3) * 0.08,
      color: fishColors[(seed + i) % fishColors.length],
      size: 0.08 + (i % 3) * 0.03,
    }))
  }, [seed, fishColors])

  return (
    <group position={center}>
      {fishData.map((f, i) => (
        <Fish key={i} {...f} />
      ))}
    </group>
  )
}

export default function SeaLife() {
  const theme = useTheme()
  const fc = theme.fish.colors
  return (
    <group>
      <FishSchool center={[-3, 0, -8]} seed={0} />
      <FishSchool center={[5, 0, 12]} seed={5} />
      <FishSchool center={[20, 0, 20]} seed={10} />
      <FishSchool center={[-18, 0, -14]} seed={15} />

      <Fish offset={3.0} radius={10} depth={-0.5} speed={0.25} color={fc[4 % fc.length]} size={0.1} />
      <Fish offset={5.5} radius={15} depth={-0.6} speed={0.18} color={fc[7 % fc.length]} size={0.14} />
      <Fish offset={1.2} radius={8} depth={-0.45} speed={0.3} color={fc[1 % fc.length]} size={0.09} />

      <Dolphin offset={0} centerX={8} centerZ={-3} arcRadius={6} speed={0.5} />
      <Dolphin offset={3.5} centerX={-10} centerZ={10} arcRadius={5} speed={0.45} />
      <Dolphin offset={1.8} centerX={15} centerZ={5} arcRadius={7} speed={0.4} />
    </group>
  )
}
