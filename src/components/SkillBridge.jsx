import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { islands, skills } from '../data/islands'

// Find pairs of islands that share a skill
function findBridges() {
  const bridges = []
  const seen = new Set()

  for (let i = 0; i < islands.length; i++) {
    for (let j = i + 1; j < islands.length; j++) {
      const shared = islands[i].skills.filter((s) =>
        islands[j].skills.includes(s)
      )
      if (shared.length > 0) {
        const key = `${i}-${j}`
        if (!seen.has(key)) {
          seen.add(key)
          bridges.push({
            from: islands[i].position,
            to: islands[j].position,
            skills: shared,
          })
        }
      }
    }
  }
  return bridges
}

function Bridge({ from, to, bridgeSkills }) {
  const midPoint = useMemo(() => [
    (from[0] + to[0]) / 2,
    0.8,
    (from[2] + to[2]) / 2,
  ], [from, to])

  const direction = useMemo(() => {
    const dx = to[0] - from[0]
    const dz = to[2] - from[2]
    const length = Math.sqrt(dx * dx + dz * dz)
    const angle = Math.atan2(dx, dz)
    return { length, angle }
  }, [from, to])

  const skillNames = bridgeSkills
    .map((id) => skills.find((s) => s.id === id))
    .filter(Boolean)

  return (
    <group>
      {/* Bridge line (thin beam) */}
      <mesh
        position={midPoint}
        rotation={[0, direction.angle, 0]}
      >
        <boxGeometry args={[0.08, 0.06, direction.length - 3]} />
        <meshStandardMaterial
          color="#e8c8a0"
          transparent
          opacity={0.4}
          roughness={0.8}
        />
      </mesh>

      {/* Skill label at midpoint */}
      <Html position={midPoint} center distanceFactor={20} style={{ pointerEvents: 'none' }}>
        <div className="flex gap-1">
          {skillNames.map((skill) => (
            <span
              key={skill.id}
              className="px-2 py-0.5 bg-amber-900/60 text-amber-100 text-xs rounded-full backdrop-blur-sm"
            >
              {skill.icon} {skill.name}
            </span>
          ))}
        </div>
      </Html>
    </group>
  )
}

export default function SkillBridge() {
  const bridges = useMemo(findBridges, [])

  return (
    <group>
      {bridges.map((bridge, i) => (
        <Bridge
          key={i}
          from={bridge.from}
          to={bridge.to}
          bridgeSkills={bridge.skills}
        />
      ))}
    </group>
  )
}
