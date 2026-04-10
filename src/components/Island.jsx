import { useState, useMemo } from 'react'
import { Text, Outlines, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D, createNoise3D } from 'simplex-noise'
import { useStore } from '../store'
import { playWave } from '../sounds'
import { createIslandMaterial } from '../shaders/island'
import IslandAnimal from './IslandAnimals'

function useToonGradient() {
  return useMemo(() => {
    const colors = new Uint8Array([80, 160, 230])
    const tex = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat)
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.needsUpdate = true
    return tex
  }, [])
}

// Rounder, softer island geometry — Animal Crossing style
// scale affects radius and height for varied island sizes
function useIslandGeometry(seed = 0, scale = 1.0) {
  return useMemo(() => {
    const noise2D = createNoise2D(() => seed * 0.1 + 0.5)
    const noise3D = createNoise3D(() => seed * 0.2 + 0.3)

    // Vary shape based on seed — some elongated, some round
    const shapeVar = (seed % 3) / 3
    const baseRadius = 2.2 * scale
    const bottomRadius = 2.6 * scale
    const h = 0.8 * (0.8 + scale * 0.3) // taller islands for bigger scale

    const geo = new THREE.CylinderGeometry(baseRadius, bottomRadius, h, 36, 6)
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    const height = h

    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i))
      const angle = Math.atan2(v.z, v.x)
      const r = Math.sqrt(v.x * v.x + v.z * v.z)
      const normalizedY = (v.y + height / 2) / height

      // Gentler coastline — rounder, less jagged
      // Vary coastline shape: elongate some islands based on seed
      const elongation = 1 + shapeVar * 0.3 * Math.cos(angle * 2 + seed)
      const coastNoise = noise2D(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5) * 0.25 * elongation
      const radialDisplace = coastNoise * (r / bottomRadius)
      pos.setX(i, v.x + Math.cos(angle) * radialDisplace)
      pos.setZ(i, v.z + Math.sin(angle) * radialDisplace)

      // Smooth cliff sides (less rocky)
      if (normalizedY < 0.7 && r > 1.2) {
        const rockNoise = noise3D(v.x * 3, v.y * 4, v.z * 3) * 0.06
        pos.setX(i, pos.getX(i) + Math.cos(angle) * rockNoise)
        pos.setZ(i, pos.getZ(i) + Math.sin(angle) * rockNoise)
      }

      // Soft rolling hills on top
      if (normalizedY > 0.8) {
        const terrainNoise = noise2D(v.x * 2 + seed, v.z * 2) * 0.12
        pos.setY(i, v.y + terrainNoise)
      }
    }

    // Bright, cheerful vertex colors
    const colors = new Float32Array(pos.count * 3)
    const color = new THREE.Color()
    const grass1 = new THREE.Color('#66d962')     // bright lime green
    const grass2 = new THREE.Color('#4abb46')     // rich green
    const grass3 = new THREE.Color('#7ee87a')     // light spring green
    const sand = new THREE.Color('#f5e6c8')       // warm cream sand
    const cliff1 = new THREE.Color('#c4a882')     // warm tan cliff
    const cliff2 = new THREE.Color('#a08868')     // darker tan
    const underwater = new THREE.Color('#8fb8a0')  // seafoam green (underwater portion)

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const x = pos.getX(i)
      const z = pos.getZ(i)

      if (y > 0.2) {
        // Top: lush grass with 3 shades for variation
        const variation = noise2D(x * 4, z * 4)
        const variation2 = noise2D(x * 8 + 10, z * 8 + 10)
        if (variation > 0.3) color.copy(grass3)
        else if (variation > -0.2) color.copy(grass1)
        else color.copy(grass2)
        // Slight yellow tint in sunny patches
        if (variation2 > 0.5) color.lerp(new THREE.Color('#b8e86e'), 0.3)
      } else if (y > 0.0) {
        // Beach: warm creamy sand
        color.copy(sand)
        const sandVar = noise2D(x * 6, z * 6)
        if (sandVar > 0.3) color.lerp(new THREE.Color('#eed9b0'), 0.5)
      } else if (y > -0.2) {
        // Cliff face
        const rockVar = noise3D(x * 3, y * 3, z * 3)
        color.copy(rockVar > 0 ? cliff1 : cliff2)
      } else {
        // Below water line
        color.copy(underwater)
      }

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [seed, scale])
}

// Shore rocks — rounder, more colorful
function ShoreRocks({ seed = 0, scale = 1.0 }) {
  const gradientMap = useToonGradient()
  const rocks = useMemo(() => {
    const noise = createNoise2D(() => seed * 0.3 + 0.7)
    const rockColors = ['#b0a898', '#a8b0a0', '#c0b8a8', '#98a090']
    const count = Math.round(8 * scale)
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + noise(i, 0) * 0.5
      const r = (2.5 + noise(i, 1) * 0.3) * scale
      return {
        position: [Math.cos(angle) * r, -0.25, Math.sin(angle) * r],
        scale: 0.05 + Math.abs(noise(i, 2)) * 0.08,
        rotation: [noise(i, 3), noise(i, 4), noise(i, 5)],
        color: rockColors[i % rockColors.length],
      }
    })
  }, [seed, scale])

  return rocks.map((rock, i) => (
    <mesh key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} castShadow>
      <dodecahedronGeometry args={[1, 1]} />
      <meshToonMaterial color={rock.color} gradientMap={gradientMap} />
    </mesh>
  ))
}

// Round cartoon tree (Animal Crossing style)
function RoundTree({ position = [0, 0, 0], scale = 1, variant = 0 }) {
  const gradientMap = useToonGradient()
  const foliageColors = ['#4dbd4a', '#5cc85a', '#3da83a', '#68d466']
  const trunkColor = '#8B6840'
  const mainColor = foliageColors[variant % foliageColors.length]
  const darkColor = foliageColors[(variant + 2) % foliageColors.length]

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.6, 6]} />
        <meshToonMaterial color={trunkColor} gradientMap={gradientMap} />
        <Outlines thickness={0.012} color="#5a3a20" />
      </mesh>
      {/* Main foliage ball */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.4, 10, 8]} />
        <meshToonMaterial color={mainColor} gradientMap={gradientMap} />
        <Outlines thickness={0.015} color="#2a6628" />
      </mesh>
      {/* Secondary foliage bumps */}
      <mesh position={[0.2, 0.95, 0.1]} castShadow>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshToonMaterial color={darkColor} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.15, 0.9, -0.12]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshToonMaterial color={mainColor} gradientMap={gradientMap} />
      </mesh>
    </group>
  )
}

// Palm tree — brighter, more tropical
function PalmTree({ position = [0, 0, 0], scale = 1 }) {
  const gradientMap = useToonGradient()
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.07, 1.2, 6]} />
        <meshToonMaterial color="#a07830" gradientMap={gradientMap} />
        <Outlines thickness={0.012} color="#5a4020" />
      </mesh>
      {/* Coconuts */}
      <mesh position={[0.06, 0.95, 0.06]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshToonMaterial color="#6a5030" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.05, 0.93, -0.04]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshToonMaterial color="#6a5030" gradientMap={gradientMap} />
      </mesh>
      {/* Leaves — brighter green */}
      {[0, 1.05, 2.1, 3.15, 4.2, 5.25].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.sin(angle) * 0.25, 1.05, Math.cos(angle) * 0.25]}
          rotation={[Math.sin(angle) * 0.7, angle, Math.cos(angle) * 0.3]}
          castShadow
        >
          <boxGeometry args={[0.08, 0.025, 0.55]} />
          <meshToonMaterial color="#48c858" gradientMap={gradientMap} />
        </mesh>
      ))}
    </group>
  )
}

// Flowers — small colorful clusters
function FlowerPatch({ position, seed = 0 }) {
  const gradientMap = useToonGradient()
  const flowers = useMemo(() => {
    const noise = createNoise2D(() => seed * 0.4 + 0.2)
    const petalColors = ['#ff8fa0', '#ffb347', '#fff06a', '#a8d8ff', '#dda0dd', '#ff6b8a', '#87e897']
    return Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + noise(i, 0) * 0.8
      const r = 0.1 + Math.abs(noise(i, 1)) * 0.15
      return {
        pos: [Math.cos(angle) * r, 0.02, Math.sin(angle) * r],
        color: petalColors[Math.floor(Math.abs(noise(i, 2)) * petalColors.length) % petalColors.length],
        scale: 0.03 + Math.abs(noise(i, 3)) * 0.02,
      }
    })
  }, [seed])

  return (
    <group position={position}>
      {flowers.map((f, i) => (
        <group key={i} position={f.pos}>
          {/* Petals — flat discs */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[f.scale, 6]} />
            <meshToonMaterial color={f.color} gradientMap={gradientMap} side={THREE.DoubleSide} />
          </mesh>
          {/* Center dot */}
          <mesh position={[0, 0.005, 0]}>
            <sphereGeometry args={[f.scale * 0.4, 6, 4]} />
            <meshToonMaterial color="#fff8a0" gradientMap={gradientMap} />
          </mesh>
          {/* Stem */}
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.08, 4]} />
            <meshToonMaterial color="#5aaa40" gradientMap={gradientMap} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Bushes — rounder, cuter
function Bush({ position }) {
  const gradientMap = useToonGradient()
  return (
    <group position={position}>
      {/* Main bush sphere */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshToonMaterial color="#4cc050" gradientMap={gradientMap} />
        <Outlines thickness={0.01} color="#2a7030" />
      </mesh>
      {/* Secondary bumps */}
      <mesh position={[0.12, 0.14, 0.06]} castShadow>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshToonMaterial color="#5ad060" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.1, 0.12, -0.05]} castShadow>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshToonMaterial color="#42b848" gradientMap={gradientMap} />
      </mesh>
    </group>
  )
}

// Dock — warmer, friendlier colors
function Dock({ position = [0, 0, 0] }) {
  const gradientMap = useToonGradient()
  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[0.8, 0.06, 2.5]} />
        <meshToonMaterial color="#c8a060" gradientMap={gradientMap} />
        <Outlines thickness={0.012} color="#7a5830" />
      </mesh>
      {[-0.8, 0, 0.8].map((z, i) => (
        <group key={i}>
          <mesh position={[-0.35, -0.35, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            <meshToonMaterial color="#8a6838" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.35, -0.35, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            <meshToonMaterial color="#8a6838" gradientMap={gradientMap} />
          </mesh>
        </group>
      ))}
      {/* Mooring post */}
      <mesh position={[0, 0.0, 1.2]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.25, 6]} />
        <meshToonMaterial color="#8a6838" gradientMap={gradientMap} />
        <Outlines thickness={0.012} color="#5a3a18" />
      </mesh>
    </group>
  )
}

// Wooden sign — rounder, more colorful
function WoodenSign({ name, position = [0, 0, 0] }) {
  const gradientMap = useToonGradient()
  return (
    <group position={position} rotation={[0, 0, 0.04]}>
      {/* Two posts */}
      <mesh position={[-1.1, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 1.8, 6]} />
        <meshToonMaterial color="#6a4420" gradientMap={gradientMap} />
        <Outlines thickness={0.012} color="#3a2010" />
      </mesh>
      <mesh position={[1.1, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 1.7, 6]} />
        <meshToonMaterial color="#6a4420" gradientMap={gradientMap} />
        <Outlines thickness={0.012} color="#3a2010" />
      </mesh>
      {/* Main plank — rounded look */}
      <mesh position={[0, 1.6, 0.03]} castShadow>
        <boxGeometry args={[2.8, 0.85, 0.08]} />
        <meshToonMaterial color="#7a4a20" gradientMap={gradientMap} />
        <Outlines thickness={0.018} color="#3a1a08" />
      </mesh>
      {/* Inner plank — warm golden */}
      <mesh position={[0, 1.6, 0.07]}>
        <boxGeometry args={[2.5, 0.65, 0.04]} />
        <meshToonMaterial color="#daa850" gradientMap={gradientMap} />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 1.62, 0.1]}
        fontSize={0.26}
        color="#fff8e8"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.1}
        textAlign="center"
        outlineWidth={0.02}
        outlineColor="#4a2810"
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

  const s = data.scale || 1.0
  const islandGeo = useIslandGeometry(index + 1, s)
  const islandMat = useMemo(() => createIslandMaterial(), [])

  const dockRotation = data.dockAngle || 0
  // Dock starts at island edge (radius ~2.2*s) and extends 2.5 units outward
  const islandEdge = 2.2 * s
  const dockLength = 2.5
  const dockCenter = islandEdge + dockLength / 2  // center of the dock plank
  const dockFarEnd = islandEdge + dockLength + 1.5 // where the ark stops
  const dockEnd = [
    data.position[0] + Math.sin(dockRotation) * dockFarEnd,
    0,
    data.position[2] + Math.cos(dockRotation) * dockFarEnd,
  ]

  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedIsland(data)
    setArkTarget(dockEnd)
    setPanelOpen(true)
  }

  // Extra vegetation for bigger islands
  const extraTrees = s >= 1.3
  const extraFlowers = s >= 1.0

  return (
    <group position={[data.position[0], data.position[1] + 0.5, data.position[2]]} rotation={[0, dockRotation, 0]}>
      <group
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; playWave() }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      >
        <mesh geometry={islandGeo} position={[0, -0.1, 0]} material={islandMat} castShadow receiveShadow>
          <Outlines thickness={0.02} color="#2a5a2a" />
        </mesh>
      </group>

      {/* Mixed vegetation — scaled to island size */}
      <RoundTree position={[0.7 * s, 0.2, 0.4 * s]} scale={0.9 * s} variant={index} />
      <RoundTree position={[-0.8 * s, 0.15, -0.3 * s]} scale={0.7 * s} variant={index + 1} />
      <PalmTree position={[0.2 * s, 0.18, -0.7 * s]} scale={0.8 * s} />

      {/* Extra trees for big islands */}
      {extraTrees && <>
        <RoundTree position={[-0.3 * s, 0.2, 1.0 * s]} scale={0.85 * s} variant={index + 2} />
        <PalmTree position={[1.1 * s, 0.15, -0.1 * s]} scale={0.7 * s} />
        <RoundTree position={[-1.2 * s, 0.18, 0.5 * s]} scale={0.6 * s} variant={index + 3} />
      </>}

      {/* Bushes */}
      <Bush position={[-0.3 * s, 0.15, 0.7 * s]} />
      <Bush position={[0.6 * s, 0.15, -0.15 * s]} />
      <Bush position={[-0.7 * s, 0.12, 0.2 * s]} />

      {/* Flower patches */}
      <FlowerPatch position={[0.4 * s, 0.25, 0.8 * s]} seed={index * 3} />
      <FlowerPatch position={[-0.5 * s, 0.22, -0.6 * s]} seed={index * 3 + 1} />
      {extraFlowers && <>
        <FlowerPatch position={[1.0 * s, 0.2, -0.3 * s]} seed={index * 3 + 2} />
        <FlowerPatch position={[-0.9 * s, 0.22, 0.5 * s]} seed={index * 3 + 3} />
      </>}

      {/* Island animal */}
      <IslandAnimal index={index} position={[0.9 * s, 0.28, 0.1 * s]} />

      {/* Shore rocks */}
      <ShoreRocks seed={index + 1} scale={s} />

      {/* Dock + sign — positioned relative to island size */}
      <Dock position={[0, 0.1, dockCenter]} />
      <WoodenSign name={data.name} position={[0, 0.05, -1.0 * s]} />
    </group>
  )
}
