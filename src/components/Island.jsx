import { useState, useMemo } from 'react'
import { Text, Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D, createNoise3D } from 'simplex-noise'
import { useStore } from '../store'
import { playWave } from '../sounds'

function useToonGradient() {
  return useMemo(() => {
    const colors = new Uint8Array([60, 140, 220])
    const tex = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat)
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.needsUpdate = true
    return tex
  }, [])
}

// Organic island geometry with noise displacement + vertex colors
function useIslandGeometry(seed = 0) {
  return useMemo(() => {
    const noise2D = createNoise2D(() => seed * 0.1 + 0.5)
    const noise3D = createNoise3D(() => seed * 0.2 + 0.3)

    const geo = new THREE.CylinderGeometry(2, 2.5, 0.9, 28, 5)
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    const height = 0.9

    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i))
      const angle = Math.atan2(v.z, v.x)
      const r = Math.sqrt(v.x * v.x + v.z * v.z)
      const normalizedY = (v.y + height / 2) / height

      // Irregular coastline
      const coastNoise = noise2D(Math.cos(angle) * 2, Math.sin(angle) * 2) * 0.35
      const radialDisplace = coastNoise * (r / 2.5)
      pos.setX(i, v.x + Math.cos(angle) * radialDisplace)
      pos.setZ(i, v.z + Math.sin(angle) * radialDisplace)

      // Rocky cliff sides
      if (normalizedY < 0.8 && r > 1.0) {
        const rockNoise = noise3D(v.x * 4, v.y * 6, v.z * 4) * 0.12
        pos.setX(i, pos.getX(i) + Math.cos(angle) * rockNoise)
        pos.setZ(i, pos.getZ(i) + Math.sin(angle) * rockNoise)
      }

      // Terrain bumps on top
      if (normalizedY > 0.85) {
        const terrainNoise = noise2D(v.x * 2.5 + seed, v.z * 2.5) * 0.15
        pos.setY(i, v.y + terrainNoise)
      }
    }

    // Vertex colors: grass on top, sand at edge, rock on sides
    const colors = new Float32Array(pos.count * 3)
    const color = new THREE.Color()
    const grass = new THREE.Color('#4cad50')
    const darkGrass = new THREE.Color('#388e3c')
    const sand = new THREE.Color('#e8d5a0')
    const rock = new THREE.Color('#8a7a65')
    const darkRock = new THREE.Color('#6b5c4a')

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const r = Math.sqrt(pos.getX(i) ** 2 + pos.getZ(i) ** 2)

      if (y > 0.15) {
        // Top: grass with variation
        const variation = noise2D(pos.getX(i) * 5, pos.getZ(i) * 5)
        color.copy(variation > 0 ? grass : darkGrass)
      } else if (y > 0.0) {
        // Edge: sandy beach
        color.copy(sand)
      } else {
        // Sides: rocky cliff
        const rockVar = noise3D(pos.getX(i) * 3, pos.getY(i) * 3, pos.getZ(i) * 3)
        color.copy(rockVar > 0 ? rock : darkRock)
      }

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [seed])
}

// Shore rocks
function ShoreRocks({ seed = 0 }) {
  const gradientMap = useToonGradient()
  const rocks = useMemo(() => {
    const noise = createNoise2D(() => seed * 0.3 + 0.7)
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2 + noise(i, 0) * 0.4
      const r = 2.3 + noise(i, 1) * 0.3
      return {
        position: [Math.cos(angle) * r, -0.3, Math.sin(angle) * r],
        scale: 0.06 + Math.abs(noise(i, 2)) * 0.1,
        rotation: [noise(i, 3), noise(i, 4), noise(i, 5)],
      }
    })
  }, [seed])

  return rocks.map((rock, i) => (
    <mesh key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} castShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color="#7a7a6a" gradientMap={gradientMap} />
    </mesh>
  ))
}

// Better palm tree
function PalmTree({ position = [0, 0, 0], scale = 1 }) {
  const gradientMap = useToonGradient()
  return (
    <group position={position} scale={scale}>
      {/* Curved trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.07, 1.2, 6]} />
        <meshToonMaterial color="#8a6b20" gradientMap={gradientMap} />
        <Outlines thickness={0.015} color="#4a3510" />
      </mesh>
      {/* Coconuts */}
      <mesh position={[0.06, 0.95, 0.06]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshToonMaterial color="#5a4020" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.05, 0.93, -0.04]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshToonMaterial color="#5a4020" gradientMap={gradientMap} />
      </mesh>
      {/* Leaves — longer, droopy */}
      {[0, 1.05, 2.1, 3.15, 4.2, 5.25].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.sin(angle) * 0.25, 1.05, Math.cos(angle) * 0.25]}
          rotation={[Math.sin(angle) * 0.7, angle, Math.cos(angle) * 0.3]}
          castShadow
        >
          <boxGeometry args={[0.08, 0.025, 0.55]} />
          <meshToonMaterial color="#3aaa50" gradientMap={gradientMap} />
        </mesh>
      ))}
    </group>
  )
}

// Bushes
function Bush({ position }) {
  const gradientMap = useToonGradient()
  return (
    <group position={position}>
      {[0, 1.5, 3, 4.5].map((a, i) => (
        <mesh key={i}
          position={[Math.sin(a) * 0.1, 0.06, Math.cos(a) * 0.1]}
          scale={0.7 + (i % 2) * 0.3}
          castShadow
        >
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshToonMaterial color={i % 2 ? '#2d8a4e' : '#3caa55'} gradientMap={gradientMap} />
        </mesh>
      ))}
    </group>
  )
}

// Dock
function Dock({ position = [0, 0, 0] }) {
  const gradientMap = useToonGradient()
  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[0.8, 0.06, 2.5]} />
        <meshToonMaterial color="#b08040" gradientMap={gradientMap} />
        <Outlines thickness={0.015} color="#4a3010" />
      </mesh>
      {[-0.8, 0, 0.8].map((z, i) => (
        <group key={i}>
          <mesh position={[-0.35, -0.35, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            <meshToonMaterial color="#5C3D1E" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.35, -0.35, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            <meshToonMaterial color="#5C3D1E" gradientMap={gradientMap} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.0, 1.2]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 6]} />
        <meshToonMaterial color="#5C3D1E" gradientMap={gradientMap} />
        <Outlines thickness={0.015} color="#2a1505" />
      </mesh>
    </group>
  )
}

// Wooden sign
function WoodenSign({ name, position = [0, 0, 0] }) {
  const gradientMap = useToonGradient()
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 1.4, 6]} />
        <meshToonMaterial color="#5C3D1E" gradientMap={gradientMap} />
        <Outlines thickness={0.015} color="#2a1505" />
      </mesh>
      <mesh position={[0, 1.35, 0.03]} castShadow>
        <boxGeometry args={[2.2, 0.7, 0.06]} />
        <meshToonMaterial color="#6B3A1F" gradientMap={gradientMap} />
        <Outlines thickness={0.015} color="#2a1505" />
      </mesh>
      <mesh position={[0, 1.35, 0.06]}>
        <boxGeometry args={[2.0, 0.55, 0.05]} />
        <meshToonMaterial color="#d4a050" gradientMap={gradientMap} />
      </mesh>
      <Text
        position={[0, 1.35, 0.1]}
        fontSize={0.22}
        color="#2a1505"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {name}
      </Text>
    </group>
  )
}

export default function Island({ data, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const setSelectedIsland = useStore((s) => s.setSelectedIsland)
  const setArkTarget = useStore((s) => s.setArkTarget)
  const setPanelOpen = useStore((s) => s.setPanelOpen)
  const gradientMap = useToonGradient()

  const islandGeo = useIslandGeometry(index + 1)

  const dockRotation = Math.atan2(-data.position[0], -data.position[2])
  const dist = Math.sqrt(data.position[0] ** 2 + data.position[2] ** 2)
  const dirX = -data.position[0] / dist
  const dirZ = -data.position[2] / dist
  const dockEnd = [data.position[0] + dirX * 5, 0, data.position[2] + dirZ * 5]

  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedIsland(data)
    setArkTarget(dockEnd)
    setPanelOpen(true)
  }

  return (
    <group position={data.position} rotation={[0, dockRotation, 0]}>
      <group
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; playWave() }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      >
        {/* Organic island mesh with vertex colors */}
        <mesh geometry={islandGeo} position={[0, -0.1, 0]} castShadow receiveShadow>
          <meshToonMaterial vertexColors gradientMap={gradientMap} />
          <Outlines thickness={0.025} color="#1a1a1a" />
        </mesh>
      </group>

      {/* Vegetation */}
      <PalmTree position={[0.8, 0.2, 0.5]} scale={1.0} />
      <PalmTree position={[-0.6, 0.15, -0.4]} scale={0.8} />
      <PalmTree position={[0.2, 0.18, -0.7]} scale={0.7} />
      <Bush position={[-0.3, 0.15, 0.6]} />
      <Bush position={[0.5, 0.15, -0.2]} />

      {/* Shore rocks */}
      <ShoreRocks seed={index + 1} />

      {/* Dock + sign */}
      <Dock position={[0, 0.1, 2.8]} />
      <WoodenSign name={data.name} position={[0, 0.05, -1.0]} />
    </group>
  )
}
