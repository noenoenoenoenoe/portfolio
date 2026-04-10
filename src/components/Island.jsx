import { useState, useMemo } from 'react'
import { Text, Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D, createNoise3D } from 'simplex-noise'
import { useStore, useTheme } from '../store'
import { playWave } from '../sounds'
import { createIslandMaterial } from '../shaders/island'
import { createWoodMaterial } from '../shaders/wood'
import IslandAnimal from './IslandAnimals'

function useToonGradient() {
  const toonSteps = useTheme().toonSteps
  return useMemo(() => {
    // 2-step (Ghibli): hard shadow/lit edge. 3-step (Pokemon): bright/mid/shadow
    const colors = toonSteps === 2
      ? new Uint8Array([100, 230])           // hard 2-step: shadow | lit
      : new Uint8Array([80, 160, 230])       // soft 3-step: shadow | mid | lit
    const tex = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat)
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.needsUpdate = true
    return tex
  }, [toonSteps])
}

// Island geometry — shaped by theme
function useIslandGeometry(seed = 0, scale = 1.0, islandColors, geoConfig) {
  return useMemo(() => {
    const noise2D = createNoise2D(() => seed * 0.1 + 0.5)
    const noise3D = createNoise3D(() => seed * 0.2 + 0.3)

    const hScale = geoConfig?.heightScale || 1.0
    const topFlat = geoConfig?.topFlatness || 0.12
    const cliffRough = geoConfig?.cliffRoughness || 0.06

    const shapeVar = (seed % 3) / 3
    const baseRadius = 2.2 * scale
    const bottomRadius = 2.6 * scale
    const h = 0.8 * (0.8 + scale * 0.3) * hScale

    const geo = new THREE.CylinderGeometry(baseRadius, bottomRadius, h, 42, Math.max(6, Math.round(6 * hScale)))
    const pos = geo.attributes.position
    const v = new THREE.Vector3()
    const height = h

    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i))
      const angle = Math.atan2(v.z, v.x)
      const r = Math.sqrt(v.x * v.x + v.z * v.z)
      const normalizedY = (v.y + height / 2) / height

      const elongation = 1 + shapeVar * 0.3 * Math.cos(angle * 2 + seed)
      const coastNoise = noise2D(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5) * 0.25 * elongation
      const radialDisplace = coastNoise * (r / bottomRadius)
      pos.setX(i, v.x + Math.cos(angle) * radialDisplace)
      pos.setZ(i, v.z + Math.sin(angle) * radialDisplace)

      if (normalizedY < 0.7 && r > 1.2) {
        const rockNoise = noise3D(v.x * 3, v.y * 4, v.z * 3) * cliffRough
        pos.setX(i, pos.getX(i) + Math.cos(angle) * rockNoise)
        pos.setZ(i, pos.getZ(i) + Math.sin(angle) * rockNoise)
      }

      if (normalizedY > 0.8) {
        const terrainNoise = noise2D(v.x * 2 + seed, v.z * 2) * topFlat
        pos.setY(i, v.y + terrainNoise)
      }
    }

    const ic = islandColors
    const colors = new Float32Array(pos.count * 3)
    const color = new THREE.Color()
    const grass1 = new THREE.Color(ic.grass[0])
    const grass2 = new THREE.Color(ic.grass[1])
    const grass3 = new THREE.Color(ic.grass[2])
    const sand = new THREE.Color(ic.sand)
    const cliff1 = new THREE.Color(ic.cliff[0])
    const cliff2 = new THREE.Color(ic.cliff[1])
    const underwater = new THREE.Color(ic.underwater)

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const x = pos.getX(i)
      const z = pos.getZ(i)

      if (y > 0.2) {
        const variation = noise2D(x * 4, z * 4)
        const variation2 = noise2D(x * 8 + 10, z * 8 + 10)
        if (variation > 0.3) color.copy(grass3)
        else if (variation > -0.2) color.copy(grass1)
        else color.copy(grass2)
        if (variation2 > 0.5) color.lerp(new THREE.Color(ic.grassSunny), 0.3)
      } else if (y > 0.0) {
        color.copy(sand)
        const sandVar = noise2D(x * 6, z * 6)
        if (sandVar > 0.3) color.lerp(new THREE.Color(ic.sandVariant), 0.5)
      } else if (y > -0.2) {
        const rockVar = noise3D(x * 3, y * 3, z * 3)
        color.copy(rockVar > 0 ? cliff1 : cliff2)
      } else {
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
  }, [seed, scale, islandColors, geoConfig])
}

// Shore rocks
function ShoreRocks({ seed = 0, scale = 1.0 }) {
  const theme = useTheme()
  const gradientMap = useToonGradient()
  const toon = theme.useToonShading
  const rockColors = theme.rocks.colors
  const rg = theme.geometry.rocks
  const rocks = useMemo(() => {
    const noise = createNoise2D(() => seed * 0.3 + 0.7)
    const count = Math.round((rg?.count || 8) * scale)
    const sMin = rg?.sizeMin || 0.05
    const sMax = rg?.sizeMax || 0.13
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + noise(i, 0) * 0.5
      const r = (2.5 + noise(i, 1) * 0.3) * scale
      return {
        position: [Math.cos(angle) * r, -0.25, Math.sin(angle) * r],
        scale: sMin + Math.abs(noise(i, 2)) * (sMax - sMin),
        rotation: [noise(i, 3), noise(i, 4), noise(i, 5)],
        color: rockColors[i % rockColors.length],
      }
    })
  }, [seed, scale, rockColors, rg])

  return rocks.map((rock, i) => (
    <mesh key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} castShadow>
      <dodecahedronGeometry args={[1, rg?.detail || 1]} />
      {toon
        ? <meshToonMaterial color={rock.color} gradientMap={gradientMap} />
        : <meshStandardMaterial color={rock.color} roughness={0.8} />
      }
    </mesh>
  ))
}

// Tree — shape driven by theme geometry
function RoundTree({ position = [0, 0, 0], scale = 1, variant = 0 }) {
  const theme = useTheme()
  const gradientMap = useToonGradient()
  const t = theme.trees
  const g = theme.geometry.tree
  const toon = theme.useToonShading
  const ol = theme.outlineThickness
  const foliageColors = t.foliage

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, g.trunkHeight * 0.58, 0]} castShadow>
        <cylinderGeometry args={[g.trunkTopR, g.trunkBottomR, g.trunkHeight, 6]} />
        {toon ? <meshToonMaterial color={t.trunk} gradientMap={gradientMap} /> : <meshStandardMaterial color={t.trunk} roughness={0.8} />}
        {ol > 0 && t.trunkOutline !== 'none' && <Outlines thickness={0.012 * ol} color={t.trunkOutline} />}
      </mesh>
      {/* Foliage — data-driven balls */}
      {g.foliageBalls.map((ball, i) => (
        <mesh key={i} position={ball.offset} castShadow>
          <sphereGeometry args={[ball.radius, 10, 8]} />
          {toon
            ? <meshToonMaterial color={foliageColors[(variant + i) % foliageColors.length]} gradientMap={gradientMap} />
            : <meshStandardMaterial color={foliageColors[(variant + i) % foliageColors.length]} roughness={0.8} />
          }
          {i === 0 && ol > 0 && t.foliageOutline !== 'none' && <Outlines thickness={0.015 * ol} color={t.foliageOutline} />}
        </mesh>
      ))}
    </group>
  )
}

// Palm / olive tree — shape driven by theme
function PalmTree({ position = [0, 0, 0], scale = 1 }) {
  const theme = useTheme()
  const gradientMap = useToonGradient()
  const t = theme.trees
  const g = theme.geometry.palm
  const toon = theme.useToonShading
  const ol = theme.outlineThickness
  const isOlive = g.type === 'olive'

  return (
    <group position={position} scale={scale}>
      {/* Trunk — optionally curved/gnarled */}
      <group rotation={g.trunkCurve > 0 ? [g.trunkCurve * 0.3, 0, g.trunkCurve * 0.2] : [0, 0, 0]}>
        <mesh position={[0, g.trunkHeight * 0.42, 0]} castShadow>
          <cylinderGeometry args={[g.trunkTopR, g.trunkBottomR, g.trunkHeight, 6]} />
          {toon ? <meshToonMaterial color={t.palmTrunk} gradientMap={gradientMap} /> : <meshStandardMaterial color={t.palmTrunk} roughness={0.8} />}
          {ol > 0 && t.palmTrunkOutline !== 'none' && <Outlines thickness={0.012 * ol} color={t.palmTrunkOutline} />}
        </mesh>
      </group>

      {/* Olive mode: wide flat canopy */}
      {isOlive && g.canopyBalls && g.canopyBalls.map((ball, i) => (
        <mesh key={`c${i}`} position={ball.offset} castShadow>
          <sphereGeometry args={[ball.radius, 10, 8]} />
          {toon
            ? <meshToonMaterial color={t.foliage[i % t.foliage.length]} gradientMap={gradientMap} />
            : <meshStandardMaterial color={t.foliage[i % t.foliage.length]} roughness={0.8} />
          }
        </mesh>
      ))}

      {/* Palm mode: coconuts + fronds */}
      {!isOlive && g.hasCoconuts && <>
        <mesh position={[0.06, g.trunkHeight * 0.79, 0.06]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          {toon ? <meshToonMaterial color={t.coconut} gradientMap={gradientMap} /> : <meshStandardMaterial color={t.coconut} roughness={0.8} />}
        </mesh>
        <mesh position={[-0.05, g.trunkHeight * 0.77, -0.04]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          {toon ? <meshToonMaterial color={t.coconut} gradientMap={gradientMap} /> : <meshStandardMaterial color={t.coconut} roughness={0.8} />}
        </mesh>
      </>}

      {!isOlive && g.leafCount > 0 && Array.from({ length: g.leafCount }, (_, i) => {
        const angle = (i / g.leafCount) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * 0.25, g.trunkHeight * 0.88, Math.cos(angle) * 0.25]}
            rotation={[Math.sin(angle) * g.leafDroop, angle, Math.cos(angle) * 0.3]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.025, g.leafLength]} />
            {toon ? <meshToonMaterial color={t.palmLeaves} gradientMap={gradientMap} /> : <meshStandardMaterial color={t.palmLeaves} roughness={0.8} />}
          </mesh>
        )
      })}
    </group>
  )
}

// Flowers
function FlowerPatch({ position, seed = 0 }) {
  const theme = useTheme()
  const gradientMap = useToonGradient()
  const f = theme.flowers
  const toon = theme.useToonShading
  const flowers = useMemo(() => {
    const noise = createNoise2D(() => seed * 0.4 + 0.2)
    return Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + noise(i, 0) * 0.8
      const r = 0.1 + Math.abs(noise(i, 1)) * 0.15
      return {
        pos: [Math.cos(angle) * r, 0.02, Math.sin(angle) * r],
        color: f.petals[Math.floor(Math.abs(noise(i, 2)) * f.petals.length) % f.petals.length],
        scale: 0.03 + Math.abs(noise(i, 3)) * 0.02,
      }
    })
  }, [seed, f.petals])

  return (
    <group position={position}>
      {flowers.map((fl, i) => (
        <group key={i} position={fl.pos}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[fl.scale, 6]} />
            {toon
              ? <meshToonMaterial color={fl.color} gradientMap={gradientMap} side={THREE.DoubleSide} />
              : <meshStandardMaterial color={fl.color} roughness={0.8} side={THREE.DoubleSide} />
            }
          </mesh>
          <mesh position={[0, 0.005, 0]}>
            <sphereGeometry args={[fl.scale * 0.4, 6, 4]} />
            {toon ? <meshToonMaterial color={f.center} gradientMap={gradientMap} /> : <meshStandardMaterial color={f.center} roughness={0.8} />}
          </mesh>
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.08, 4]} />
            {toon ? <meshToonMaterial color={f.stem} gradientMap={gradientMap} /> : <meshStandardMaterial color={f.stem} roughness={0.8} />}
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Bushes — data-driven from theme geometry
function Bush({ position }) {
  const theme = useTheme()
  const gradientMap = useToonGradient()
  const b = theme.bushes
  const balls = theme.geometry.bush.balls
  const toon = theme.useToonShading
  const ol = theme.outlineThickness
  const colors = [b.main, ...(b.secondary || [])]
  return (
    <group position={position}>
      {balls.map((ball, i) => (
        <mesh key={i} position={ball.offset} castShadow>
          <sphereGeometry args={[ball.radius, 8, 6]} />
          {toon
            ? <meshToonMaterial color={colors[i % colors.length]} gradientMap={gradientMap} />
            : <meshStandardMaterial color={colors[i % colors.length]} roughness={0.8} />
          }
          {i === 0 && ol > 0 && b.outline !== 'none' && <Outlines thickness={0.01 * ol} color={b.outline} />}
        </mesh>
      ))}
    </group>
  )
}

// Dock
function Dock({ position = [0, 0, 0] }) {
  const theme = useTheme()
  const gradientMap = useToonGradient()
  const d = theme.dock
  const toon = theme.useToonShading
  const ol = theme.outlineThickness
  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[0.8, 0.06, 2.5]} />
        {toon ? <meshToonMaterial color={d.platform} gradientMap={gradientMap} /> : <meshStandardMaterial color={d.platform} roughness={0.8} />}
        {ol > 0 && d.platformOutline !== 'none' && <Outlines thickness={0.012 * ol} color={d.platformOutline} />}
      </mesh>
      {[-0.8, 0, 0.8].map((z, i) => (
        <group key={i}>
          <mesh position={[-0.35, -0.35, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            {toon ? <meshToonMaterial color={d.supports} gradientMap={gradientMap} /> : <meshStandardMaterial color={d.supports} roughness={0.8} />}
          </mesh>
          <mesh position={[0.35, -0.35, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            {toon ? <meshToonMaterial color={d.supports} gradientMap={gradientMap} /> : <meshStandardMaterial color={d.supports} roughness={0.8} />}
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.0, 1.2]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.25, 6]} />
        {toon ? <meshToonMaterial color={d.mooringPost} gradientMap={gradientMap} /> : <meshStandardMaterial color={d.mooringPost} roughness={0.8} />}
        {ol > 0 && d.mooringOutline !== 'none' && <Outlines thickness={0.012 * ol} color={d.mooringOutline} />}
      </mesh>
    </group>
  )
}

// Wooden sign
function WoodenSign({ name, position = [0, 0, 0] }) {
  const theme = useTheme()
  const s = theme.sign
  const toon = theme.useToonShading
  const ol = theme.outlineThickness
  const woodMat = useMemo(() => createWoodMaterial({
    baseColor: s.plankBase,
    darkColor: s.plankDark,
    lightColor: s.plankLight,
    grainDir: 1,
    plankScale: 2.5,
    toonLighting: toon,
    toonSteps: theme.toonSteps,
  }), [s.plankBase, s.plankDark, s.plankLight, toon, theme.toonSteps])

  return (
    <group position={position} rotation={[0, 0, 0.04]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 1.6, 6]} />
        {toon ? <meshToonMaterial color={s.post} /> : <meshStandardMaterial color={s.post} roughness={0.8} />}
        {ol > 0 && s.postOutline !== 'none' && <Outlines thickness={0.012 * ol} color={s.postOutline} />}
      </mesh>

      <mesh position={[0, 1.55, 0.03]} material={woodMat} castShadow>
        <boxGeometry args={[2.6, 0.7, 0.07, 4, 4, 1]} />
        {ol > 0 && s.plankOutline !== 'none' && <Outlines thickness={0.015 * ol} color={s.plankOutline} />}
      </mesh>

      <Text
        position={[0, 1.57, 0.08]}
        fontSize={0.24}
        font={`${import.meta.env.BASE_URL}fonts/PermanentMarker-Regular.ttf`}
        color={s.textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
        textAlign="center"
        outlineWidth={0.008}
        outlineColor={s.textOutline}
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
  const theme = useTheme()
  const ol = theme.outlineThickness

  const s = data.scale || 1.0
  const islandGeo = useIslandGeometry(index + 1, s, theme.island, theme.geometry.island)
  const islandMat = useMemo(
    () => createIslandMaterial({ toonSteps: theme.toonSteps }),
    [theme.toonSteps]
  )

  const dockRotation = data.dockAngle || 0
  const islandEdge = 2.2 * s
  const dockLength = 2.5
  const dockCenter = islandEdge + dockLength / 2
  const dockFarEnd = islandEdge + dockLength + 1.5
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
          {ol > 0 && theme.island.outlineColor !== 'none' && <Outlines thickness={0.02 * ol} color={theme.island.outlineColor} />}
        </mesh>
      </group>

      <RoundTree position={[0.7 * s, 0.2, 0.4 * s]} scale={0.9 * s} variant={index} />
      <RoundTree position={[-0.8 * s, 0.15, -0.3 * s]} scale={0.7 * s} variant={index + 1} />
      <PalmTree position={[0.2 * s, 0.18, -0.7 * s]} scale={0.8 * s} />

      {extraTrees && <>
        <RoundTree position={[-0.3 * s, 0.2, 1.0 * s]} scale={0.85 * s} variant={index + 2} />
        <PalmTree position={[1.1 * s, 0.15, -0.1 * s]} scale={0.7 * s} />
        <RoundTree position={[-1.2 * s, 0.18, 0.5 * s]} scale={0.6 * s} variant={index + 3} />
      </>}

      <Bush position={[-0.3 * s, 0.15, 0.7 * s]} />
      <Bush position={[0.6 * s, 0.15, -0.15 * s]} />
      <Bush position={[-0.7 * s, 0.12, 0.2 * s]} />

      <FlowerPatch position={[0.4 * s, 0.25, 0.8 * s]} seed={index * 3} />
      <FlowerPatch position={[-0.5 * s, 0.22, -0.6 * s]} seed={index * 3 + 1} />
      {extraFlowers && <>
        <FlowerPatch position={[1.0 * s, 0.2, -0.3 * s]} seed={index * 3 + 2} />
        <FlowerPatch position={[-0.9 * s, 0.22, 0.5 * s]} seed={index * 3 + 3} />
      </>}

      <IslandAnimal index={index} position={[0.9 * s, 0.28, 0.1 * s]} />
      <ShoreRocks seed={index + 1} scale={s} />

      <Dock position={[0, 0.1, dockCenter]} />
      <WoodenSign name={data.name} position={[0, 0.05, -1.0 * s]} />
    </group>
  )
}
