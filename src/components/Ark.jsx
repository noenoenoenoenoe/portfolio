import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import confetti from 'canvas-confetti'
import { useStore, useTheme } from '../store'
import { captainData } from '../data/islands'
import { playSplash, playCreak, playBell, playWave } from '../sounds'
import { createWoodMaterial } from '../shaders/wood'

function useToonGradient() {
  const toonSteps = useTheme().toonSteps
  return useMemo(() => {
    const colors = toonSteps === 2
      ? new Uint8Array([100, 230])
      : new Uint8Array([80, 160, 230])
    const tex = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat)
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.needsUpdate = true
    return tex
  }, [toonSteps])
}

// Toon helper — uses theme for material + outlines
function Toon({ color, children, outline = true, outlineColor, outlineWidth = 0.018, ...props }) {
  const theme = useTheme()
  const g = useToonGradient()
  const toon = theme.useToonShading
  const ol = theme.outlineThickness
  const oc = outlineColor || '#3a2010'
  const showOutline = outline && ol > 0 && oc !== 'none'

  return (
    <mesh {...props} castShadow>
      {children}
      {toon ? <meshToonMaterial color={color} gradientMap={g} /> : <meshStandardMaterial color={color} roughness={0.8} />}
      {showOutline && <Outlines thickness={outlineWidth * ol} color={oc} />}
    </mesh>
  )
}

// Hull station presets per theme
const HULL_STATIONS = {
  round: [ // Pokemon — wide, friendly tub
    [-1.8, 0.0, 0.55, 0.25], [-1.5, 0.25, 0.35, 0.18],
    [-1.1, 0.6, 0.15, 0.08], [-0.8, 0.85, 0.05, 0.03],
    [-0.4, 1.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.4, 1.0, 0.0, 0.0],
    [0.8, 0.85, 0.05, 0.03], [1.1, 0.6, 0.15, 0.10],
    [1.5, 0.25, 0.38, 0.22], [1.8, 0.0, 0.60, 0.30],
  ],
  trireme: [ // AC — long narrow Greek warship
    [-2.5, 0.0, 0.60, 0.30], [-2.2, 0.12, 0.48, 0.24],
    [-1.7, 0.35, 0.30, 0.15], [-1.2, 0.60, 0.15, 0.08],
    [-0.6, 0.85, 0.05, 0.03], [0.0, 1.0, 0.0, 0.0],
    [0.6, 1.0, 0.0, 0.0], [1.2, 0.85, 0.05, 0.03],
    [1.7, 0.55, 0.12, 0.06], [2.2, 0.20, 0.35, 0.20],
    [2.5, 0.0, 0.55, 0.28],
  ],
  gentle: [ // Ghibli — slightly wider, softer curves
    [-1.9, 0.0, 0.50, 0.22], [-1.6, 0.28, 0.32, 0.16],
    [-1.1, 0.65, 0.12, 0.06], [-0.7, 0.88, 0.04, 0.02],
    [-0.35, 1.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.35, 1.0, 0.0, 0.0],
    [0.7, 0.88, 0.04, 0.02], [1.1, 0.65, 0.12, 0.08],
    [1.6, 0.28, 0.35, 0.20], [1.9, 0.0, 0.55, 0.28],
  ],
}

// Hull
function Hull() {
  const theme = useTheme()
  const a = theme.ark
  const ag = theme.geometry.ark
  const geo = useMemo(() => {
    const width = ag.hullWidth
    const stations = HULL_STATIONS[ag.hullPreset] || HULL_STATIONS.round

    const maxDepth = ag.hullDepth
    const deckY = 0.05
    const heightSteps = 6

    const vertices = []
    const indices = []
    const vertColors = []

    const upper = new THREE.Color(a.hull.upper)
    const mid = new THREE.Color(a.hull.mid)
    const lower = new THREE.Color(a.hull.lower)
    const stripe = new THREE.Color(a.hull.stripe)

    const getColor = (y, normalizedY) => {
      if (normalizedY > 0.9) return upper
      if (normalizedY > 0.75) return stripe
      if (normalizedY > 0.4) return mid
      return lower
    }

    for (let si = 0; si < stations.length; si++) {
      const [z, wf, keelRise, deckRise] = stations[si]
      const w = width * wf
      const localKeelY = deckY - maxDepth + keelRise
      const localDeckY = deckY + deckRise

      for (let hi = 0; hi <= heightSteps; hi++) {
        const t = hi / heightSteps
        const y = localKeelY + (localDeckY - localKeelY) * t
        const curveF = Math.pow(t, 0.45)
        const hw = w * curveF

        vertices.push(-hw, y, z)
        const c = getColor(y, t)
        vertColors.push(c.r, c.g, c.b)

        vertices.push(hw, y, z)
        vertColors.push(c.r, c.g, c.b)
      }
    }

    const stationVerts = (heightSteps + 1) * 2

    for (let si = 0; si < stations.length - 1; si++) {
      const base = si * stationVerts
      for (let hi = 0; hi < heightSteps; hi++) {
        const row = hi * 2
        const a0 = base + row, a1 = base + row + stationVerts
        const a2 = base + row + 2, a3 = base + row + stationVerts + 2
        indices.push(a0, a1, a2)
        indices.push(a2, a1, a3)
        const b0 = base + row + 1, b1 = base + row + stationVerts + 1
        const b2 = base + row + 3, b3 = base + row + stationVerts + 3
        indices.push(b0, b2, b1)
        indices.push(b2, b3, b1)
      }
    }

    for (let si = 0; si < stations.length - 1; si++) {
      const base = si * stationVerts
      indices.push(base, base + 1, base + stationVerts)
      indices.push(base + 1, base + stationVerts + 1, base + stationVerts)
    }

    for (let si = 0; si < stations.length - 1; si++) {
      const base = si * stationVerts
      const topRow = heightSteps * 2
      const p0 = base + topRow, s0 = base + topRow + 1
      const p1 = base + stationVerts + topRow, s1 = base + stationVerts + topRow + 1
      indices.push(p0, p1, s0)
      indices.push(s0, p1, s1)
    }

    const hullGeo = new THREE.BufferGeometry()
    hullGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    hullGeo.setAttribute('color', new THREE.Float32BufferAttribute(vertColors, 3))
    hullGeo.setIndex(indices)
    hullGeo.computeVertexNormals()
    return hullGeo
  }, [a.hull.upper, a.hull.mid, a.hull.lower, a.hull.stripe])

  const woodMat = useMemo(() => createWoodMaterial({
    baseColor: a.hull.woodBase,
    darkColor: a.hull.woodDark,
    lightColor: a.hull.woodLight,
    grainDir: 0,
    plankScale: 0.6,
    toonLighting: theme.useToonShading, toonSteps: theme.toonSteps,
  }), [a.hull.woodBase, a.hull.woodDark, a.hull.woodLight, theme.useToonShading, theme.toonSteps])

  const ol = theme.outlineThickness

  return (
    <mesh geometry={geo} material={woodMat} castShadow>
      {ol > 0 && a.walls.outline !== 'none' && <Outlines thickness={0.02 * ol} color={a.walls.outline} />}
    </mesh>
  )
}

function getHullWidthAt(z, stations, width) {
  for (let i = 0; i < stations.length - 1; i++) {
    const [z0, w0] = stations[i]
    const [z1, w1] = stations[i + 1]
    if (z >= z0 && z <= z1) {
      const t = (z - z0) / (z1 - z0)
      return (w0 + (w1 - w0) * t) * width
    }
  }
  return 0
}

function useHullConfig() {
  const ag = useTheme().geometry.ark
  const stations = HULL_STATIONS[ag.hullPreset] || HULL_STATIONS.round
  const widthStations = stations.map(([z, wf]) => [z, wf])
  const zMin = stations[0][0]
  const zMax = stations[stations.length - 1][0]
  return { stations, widthStations, width: ag.hullWidth, zMin, zMax, ag }
}

// Deck
function Deck() {
  const theme = useTheme()
  const a = theme.ark
  const hull = useHullConfig()
  const geo = useMemo(() => {
    const vertices = []
    const colors = []
    const indices = []
    const light = new THREE.Color(a.deck.light)
    const dark = new THREE.Color(a.deck.dark)

    const zSpan = hull.zMax - hull.zMin
    const steps = 16
    for (let i = 0; i <= steps; i++) {
      const z = (hull.zMin + 0.1) + ((zSpan - 0.2) * i) / steps
      const hw = getHullWidthAt(z, hull.widthStations, hull.width) * 0.95
      const plank = Math.floor((z + 1.7) * 3) % 2
      const c = plank ? dark : light

      vertices.push(-hw, 0, z)
      colors.push(c.r, c.g, c.b)
      vertices.push(hw, 0, z)
      colors.push(c.r, c.g, c.b)

      if (i > 0) {
        const base = (i - 1) * 2
        indices.push(base, base + 2, base + 1)
        indices.push(base + 1, base + 2, base + 3)
      }
    }

    const deckGeo = new THREE.BufferGeometry()
    deckGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    deckGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    deckGeo.setIndex(indices)
    deckGeo.computeVertexNormals()
    return deckGeo
  }, [a.deck.light, a.deck.dark, hull])

  const deckMat = useMemo(() => createWoodMaterial({
    baseColor: a.deck.woodBase,
    darkColor: a.deck.woodDark,
    lightColor: a.deck.woodLight,
    grainDir: 1,
    plankScale: 4.0,
    toonLighting: theme.useToonShading, toonSteps: theme.toonSteps,
  }), [a.deck.woodBase, a.deck.woodDark, a.deck.woodLight, theme.useToonShading, theme.toonSteps])

  const ol = theme.outlineThickness

  return (
    <mesh geometry={geo} position={[0, 0.07, 0]} material={deckMat} castShadow>
      {ol > 0 && a.deck.outline !== 'none' && <Outlines thickness={0.012 * ol} color={a.deck.outline} />}
    </mesh>
  )
}

// Walls
function Walls() {
  const theme = useTheme()
  const a = theme.ark
  const hull = useHullConfig()

  const wallGeo = useMemo(() => {
    const vertices = []
    const colors = []
    const indices = []
    const light = new THREE.Color(a.walls.light)
    const dark = new THREE.Color(a.walls.dark)
    const wallH = hull.ag.wallHeight
    const zSpan = hull.zMax - hull.zMin
    const steps = 16

    const buildSide = (sign) => {
      const offset = vertices.length / 3
      for (let i = 0; i <= steps; i++) {
        const z = (hull.zMin + 0.1) + ((zSpan - 0.2) * i) / steps
        const hw = getHullWidthAt(z, hull.widthStations, hull.width) * 0.95
        const x = sign * hw
        const plankBot = Math.floor(0 * 8) % 2
        const plankTop = Math.floor(1 * 8) % 2

        const cb = plankBot ? dark : light
        vertices.push(x, 0, z)
        colors.push(cb.r, cb.g, cb.b)

        const ct = plankTop ? dark : light
        vertices.push(x, wallH, z)
        colors.push(ct.r, ct.g, ct.b)

        if (i > 0) {
          const base = offset + (i - 1) * 2
          if (sign > 0) {
            indices.push(base, base + 1, base + 2)
            indices.push(base + 1, base + 3, base + 2)
          } else {
            indices.push(base, base + 2, base + 1)
            indices.push(base + 1, base + 2, base + 3)
          }
        }
      }
    }

    buildSide(-1)
    buildSide(1)

    const wGeo = new THREE.BufferGeometry()
    wGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    wGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    wGeo.setIndex(indices)
    wGeo.computeVertexNormals()
    return wGeo
  }, [a.walls.light, a.walls.dark, hull])

  const wallMat = useMemo(() => createWoodMaterial({
    baseColor: a.walls.woodBase,
    darkColor: a.walls.woodDark,
    lightColor: a.walls.woodLight,
    grainDir: 0,
    plankScale: 0.8,
    toonLighting: theme.useToonShading, toonSteps: theme.toonSteps,
  }), [a.walls.woodBase, a.walls.woodDark, a.walls.woodLight, theme.useToonShading, theme.toonSteps])

  const ol = theme.outlineThickness

  return (
    <group>
      <mesh geometry={wallGeo} position={[0, 0.07, 0]} material={wallMat} castShadow>
        {ol > 0 && a.walls.outline !== 'none' && <Outlines thickness={0.012 * ol} color={a.walls.outline} />}
      </mesh>
      <Toon color={a.walls.bowsprit} position={[0, 0.15, hull.zMax - 0.1]}>
        <coneGeometry args={[hull.ag.bowspritRadius, hull.ag.bowspritLength, 6]} />
      </Toon>
    </group>
  )
}

// Cabin
function Cabin() {
  const theme = useTheme()
  const a = theme.ark
  const ag = theme.geometry.ark
  const cabinY = ag.cabinY

  const cabinGeo = useMemo(() => new THREE.BoxGeometry(...ag.cabinSize, 4, 8, 4), [ag.cabinSize])

  const cabinMat = useMemo(() => createWoodMaterial({
    baseColor: a.cabin.woodBase,
    darkColor: a.cabin.woodDark,
    lightColor: a.cabin.woodLight,
    grainDir: 2,
    plankScale: 5.0,
    toonLighting: theme.useToonShading, toonSteps: theme.toonSteps,
  }), [a.cabin.woodBase, a.cabin.woodDark, a.cabin.woodLight, theme.useToonShading, theme.toonSteps])

  const ol = theme.outlineThickness

  return (
    <group>
      <mesh geometry={cabinGeo} position={[0, cabinY, 0]} material={cabinMat} castShadow>
        {ol > 0 && a.cabin.outline !== 'none' && <Outlines thickness={0.018 * ol} color={a.cabin.outline} />}
      </mesh>
      {[-0.45, 0, 0.45].map((z, i) => (
        <group key={i}>
          <Toon color={a.cabin.windowFrame} position={[0.46, cabinY, z]} outline={false}>
            <boxGeometry args={[0.02, 0.22, 0.24]} />
          </Toon>
          <Toon color={a.cabin.windowGlass} position={[0.47, cabinY, z]} outline={false}>
            <boxGeometry args={[0.01, 0.16, 0.18]} />
          </Toon>
          <Toon color={a.cabin.windowFrame} position={[-0.46, cabinY, z]} outline={false}>
            <boxGeometry args={[0.02, 0.22, 0.24]} />
          </Toon>
          <Toon color={a.cabin.windowGlass} position={[-0.47, cabinY, z]} outline={false}>
            <boxGeometry args={[0.01, 0.16, 0.18]} />
          </Toon>
        </group>
      ))}
    </group>
  )
}

// Roof
function Roof() {
  const theme = useTheme()
  const a = theme.ark
  const g = useToonGradient()
  const toon = theme.useToonShading
  const ol = theme.outlineThickness
  const ag = theme.geometry.ark
  const geo = useMemo(() => {
    const roofGeo = new THREE.CylinderGeometry(ag.roofRadius, ag.roofRadius, ag.roofLength, 14, 3, false, 0, Math.PI)
    const pos = roofGeo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const ridge = new THREE.Color(a.roof.ridge)
    const eave = new THREE.Color(a.roof.eave)

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const t = (y + ag.roofLength / 2) / ag.roofLength
      const c = ridge.clone().lerp(eave, Math.abs(t - 0.5) * 2)
      c.toArray(colors, i * 3)
    }
    roofGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return roofGeo
  }, [a.roof.ridge, a.roof.eave, ag.roofRadius, ag.roofLength])

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, Math.PI / 2, Math.PI]} position={[0, 0.91, 0]} castShadow>
      {toon
        ? <meshToonMaterial vertexColors gradientMap={g} />
        : <meshStandardMaterial vertexColors roughness={0.7} />
      }
      {ol > 0 && a.roof.outline !== 'none' && <Outlines thickness={0.018 * ol} color={a.roof.outline} />}
    </mesh>
  )
}

// Animals peeking from cabin — keep colors as-is (small details)
function Animals() {
  const cabinY = 0.66
  return (
    <group>
      <group position={[0.5, cabinY + 0.08, -0.45]}>
        <Toon color="#ffd860" outlineColor="#a08020"><sphereGeometry args={[0.07, 8, 8]} /></Toon>
        <Toon color="#f0c850" outline={false} position={[-0.03, 0.07, 0]}><sphereGeometry args={[0.024, 6, 6]} /></Toon>
        <Toon color="#f0c850" outline={false} position={[0.03, 0.07, 0]}><sphereGeometry args={[0.024, 6, 6]} /></Toon>
        <Toon color="#daa840" outline={false} position={[-0.015, 0.1, 0]}><cylinderGeometry args={[0.007, 0.007, 0.06, 4]} /></Toon>
        <Toon color="#daa840" outline={false} position={[0.015, 0.1, 0]}><cylinderGeometry args={[0.007, 0.007, 0.06, 4]} /></Toon>
        <Toon color="#fff" outline={false} position={[-0.025, 0.02, 0.06]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.025, 0.02, 0.06]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[-0.025, 0.02, 0.075]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.025, 0.02, 0.075]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
        <Toon color="#e0a830" outline={false} position={[0.03, 0.0, 0.05]}><sphereGeometry args={[0.015, 4, 4]} /></Toon>
        <Toon color="#e0a830" outline={false} position={[-0.02, -0.03, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
      </group>
      <group position={[0.5, cabinY + 0.04, 0]}>
        <Toon color="#ffb060" outlineColor="#a06020"><sphereGeometry args={[0.065, 8, 8]} /></Toon>
        <Toon color="#ffb060" outline={false} position={[-0.038, 0.05, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.024, 0.048, 4]} /></Toon>
        <Toon color="#ffb060" outline={false} position={[0.038, 0.05, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.024, 0.048, 4]} /></Toon>
        <Toon color="#fff" outline={false} position={[-0.022, 0.018, 0.055]}><sphereGeometry args={[0.017, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.022, 0.018, 0.055]}><sphereGeometry args={[0.017, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[-0.022, 0.018, 0.07]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.022, 0.018, 0.07]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
        <Toon color="#ff8888" outline={false} position={[0, 0.005, 0.065]}><sphereGeometry args={[0.008, 4, 4]} /></Toon>
      </group>
      <group position={[0.5, cabinY + 0.06, 0.45]}>
        <Toon color="#88d4ff" outlineColor="#4080c0"><sphereGeometry args={[0.065, 8, 8]} /></Toon>
        <Toon color="#ffda6e" outline={false} position={[0.06, -0.01, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.02, 0.045, 4]} /></Toon>
        <Toon color="#fff" outline={false} position={[-0.022, 0.025, 0.055]}><sphereGeometry args={[0.016, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.022, 0.025, 0.055]}><sphereGeometry args={[0.016, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[-0.022, 0.025, 0.068]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.022, 0.025, 0.068]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
        <Toon color="#ffaaaa" outline={false} position={[-0.04, 0.01, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
        <Toon color="#ffaaaa" outline={false} position={[0.04, 0.01, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
        <Toon color="#68c0f0" outline={false} position={[-0.04, 0.0, -0.03]} rotation={[0.3, 0.2, 0.5]}><boxGeometry args={[0.06, 0.01, 0.04]} /></Toon>
      </group>
    </group>
  )
}

function DeckAnimals() {
  return (
    <group>
      <group position={[-0.3, 0.15, -1.0]}>
        <Toon color="#5ab870" outlineColor="#2a6830"><sphereGeometry args={[0.09, 8, 6]} /></Toon>
        <Toon color="#48a060" outline={false} position={[0, 0.03, 0]}><sphereGeometry args={[0.065, 6, 4]} /></Toon>
        <Toon color="#78cc88" outline={false} position={[0.08, 0.03, 0]}><sphereGeometry args={[0.04, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.11, 0.045, 0.02]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.11, 0.045, -0.02]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
        <Toon color="#222" outline={false} position={[0.12, 0.045, 0.02]}><sphereGeometry args={[0.006, 4, 4]} /></Toon>
        <Toon color="#222" outline={false} position={[0.12, 0.045, -0.02]}><sphereGeometry args={[0.006, 4, 4]} /></Toon>
        <Toon color="#ffbbbb" outline={false} position={[0.1, 0.02, 0.04]}><sphereGeometry args={[0.008, 4, 4]} /></Toon>
      </group>
      <group position={[0.25, 0.15, 1.1]}>
        <Toon color="#fff0f0" outlineColor="#c0a0a0"><sphereGeometry args={[0.07, 8, 8]} /></Toon>
        <Toon color="#fff0f0" outline={false} position={[0, 0.08, 0]}><sphereGeometry args={[0.055, 8, 8]} /></Toon>
        <Toon color="#fff0f0" outline={false} position={[-0.02, 0.16, 0]} rotation={[0, 0, 0.15]}><capsuleGeometry args={[0.012, 0.06, 4, 4]} /></Toon>
        <Toon color="#fff0f0" outline={false} position={[0.02, 0.16, 0]} rotation={[0, 0, -0.15]}><capsuleGeometry args={[0.012, 0.06, 4, 4]} /></Toon>
        <Toon color="#ffaaaa" outline={false} position={[-0.02, 0.16, 0.005]} rotation={[0, 0, 0.15]}><capsuleGeometry args={[0.006, 0.04, 4, 4]} /></Toon>
        <Toon color="#ffaaaa" outline={false} position={[0.02, 0.16, 0.005]} rotation={[0, 0, -0.15]}><capsuleGeometry args={[0.006, 0.04, 4, 4]} /></Toon>
        <Toon color="#fff" outline={false} position={[-0.02, 0.09, 0.045]}><sphereGeometry args={[0.014, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.02, 0.09, 0.045]}><sphereGeometry args={[0.014, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[-0.02, 0.09, 0.057]}><sphereGeometry args={[0.008, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.02, 0.09, 0.057]}><sphereGeometry args={[0.008, 6, 6]} /></Toon>
        <Toon color="#ff9090" outline={false} position={[0, 0.075, 0.055]}><sphereGeometry args={[0.007, 4, 4]} /></Toon>
        <Toon color="#fff8f8" outline={false} position={[0, 0.0, -0.07]}><sphereGeometry args={[0.025, 6, 6]} /></Toon>
      </group>
      <group position={[0.6, 0.42, 0.5]}>
        <Toon color="#68d868" outlineColor="#308830"><sphereGeometry args={[0.05, 8, 8]} /></Toon>
        <Toon color="#fff" outline={false} position={[-0.025, 0.045, 0.02]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.025, 0.045, 0.02]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[-0.025, 0.045, 0.036]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.025, 0.045, 0.036]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
        <Toon color="#ff9090" outline={false} position={[-0.04, 0.02, 0.035]}><sphereGeometry args={[0.01, 4, 4]} /></Toon>
        <Toon color="#ff9090" outline={false} position={[0.04, 0.02, 0.035]}><sphereGeometry args={[0.01, 4, 4]} /></Toon>
      </group>
    </group>
  )
}

// Flag
function Flag() {
  const theme = useTheme()
  const a = theme.ark
  const ag = theme.geometry.ark
  const flagRef = useRef()
  const g = useToonGradient()
  const toon = theme.useToonShading

  useFrame(({ clock }) => {
    if (!flagRef.current) return
    const pos = flagRef.current.geometry.attributes.position
    const t = clock.getElapsedTime()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      pos.setZ(i, Math.sin(x * 4 + t * 3) * 0.05)
    }
    pos.needsUpdate = true
  })

  return (
    <group position={[0, 0, 1.0]}>
      <Toon color={a.flag.pole} position={[0, ag.flagPoleHeight * 1.27, 0]} outlineColor={a.flag.poleOutline !== 'none' ? a.flag.poleOutline : undefined} outline={a.flag.poleOutline !== 'none'}>
        <cylinderGeometry args={[0.028, 0.038, ag.flagPoleHeight, 6]} />
      </Toon>
      <mesh ref={flagRef} position={[0.2, ag.flagPoleHeight * 1.62, 0]}>
        <planeGeometry args={[0.4, 0.24, 8, 4]} />
        {toon
          ? <meshToonMaterial color={a.flag.cloth} gradientMap={g} side={THREE.DoubleSide} />
          : <meshStandardMaterial color={a.flag.cloth} roughness={0.6} side={THREE.DoubleSide} />
        }
      </mesh>
    </group>
  )
}

export default function Ark() {
  const groupRef = useRef()
  const arkTarget = useStore((s) => s.arkTarget)
  const setArkMoving = useStore((s) => s.setArkMoving)
  const setSelectedIsland = useStore((s) => s.setSelectedIsland)
  const setPanelOpen = useStore((s) => s.setPanelOpen)

  const handleCaptainClick = (e) => {
    e.stopPropagation()
    setSelectedIsland(captainData)
    setPanelOpen(true)
  }

  useEffect(() => {
    if (!groupRef.current) return
    const [tx, , tz] = arkTarget
    const pos = groupRef.current.position
    const dx = tx - pos.x
    const dz = tz - pos.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    if (distance < 0.5) return

    setArkMoving(true)
    playCreak()

    const targetRotY = Math.atan2(dx, dz)
    const tl = gsap.timeline({
      onComplete: () => {
        setArkMoving(false)
        playBell()
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd860', '#66d962', '#88d4ff', '#ffb060', '#f04838'],
        })
      },
    })

    tl.to(groupRef.current.rotation, { y: targetRotY, duration: 0.4, ease: 'power2.inOut' })
    tl.to(groupRef.current.position, {
      x: tx, z: tz,
      duration: 1.0 + distance * 0.04,
      ease: 'power2.inOut',
      onStart: () => playSplash(),
    })
  }, [arkTarget, setArkMoving])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = Math.sin(t * 1.2) * 0.12
  })

  return (
    <group ref={groupRef}>
      <group
        onClick={handleCaptainClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; playWave() }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <Hull />
        <Deck />
        <Walls />
        <Cabin />
        <Roof />
        <Animals />
        <DeckAnimals />
        <Flag />
      </group>
    </group>
  )
}
