import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import confetti from 'canvas-confetti'
import { useStore } from '../store'
import { captainData } from '../data/islands'
import { playSplash, playCreak, playBell, playWave } from '../sounds'
import { createWoodMaterial } from '../shaders/wood'

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

function Toon({ color, children, outline = true, outlineColor = '#3a2010', outlineWidth = 0.018, ...props }) {
  const g = useToonGradient()
  return (
    <mesh {...props} castShadow>
      {children}
      <meshToonMaterial color={color} gradientMap={g} />
      {outline && <Outlines thickness={outlineWidth} color={outlineColor} />}
    </mesh>
  )
}

// Hull — crescent profile like a traditional wooden boat
// Keel curves up at bow and stern, sides flare out
function Hull() {
  const g = useToonGradient()
  const geo = useMemo(() => {
    const width = 0.7

    // Stations: [z, widthFactor, keelRise, deckRise]
    // keelRise: how much the keel rises at this station (0 = deepest)
    // deckRise: how much the deck edge rises (gunwale sweep)
    const stations = [
      [-1.8, 0.0,  0.55, 0.25],  // stern tip — keel almost at deck level
      [-1.5, 0.25, 0.35, 0.18],
      [-1.1, 0.6,  0.15, 0.08],
      [-0.8, 0.85, 0.05, 0.03],
      [-0.4, 1.0,  0.0,  0.0],   // midship — deepest
      [ 0.0, 1.0,  0.0,  0.0],
      [ 0.4, 1.0,  0.0,  0.0],
      [ 0.8, 0.85, 0.05, 0.03],
      [ 1.1, 0.6,  0.15, 0.10],
      [ 1.5, 0.25, 0.38, 0.22],
      [ 1.8, 0.0,  0.60, 0.30],  // bow tip — keel rises high
    ]

    const maxDepth = 0.65
    const deckY = 0.05
    const heightSteps = 6

    const vertices = []
    const indices = []
    const vertColors = []

    const upper = new THREE.Color('#d4985a')
    const mid = new THREE.Color('#b87a40')
    const lower = new THREE.Color('#8a5a2a')
    const stripe = new THREE.Color('#c86840') // waterline accent

    const getColor = (y, normalizedY) => {
      if (normalizedY > 0.9) return upper
      if (normalizedY > 0.75) return stripe // red-brown waterline stripe
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

        // Hull cross-section: round bottom, flaring sides
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

    // Side faces
    for (let si = 0; si < stations.length - 1; si++) {
      const base = si * stationVerts
      for (let hi = 0; hi < heightSteps; hi++) {
        const row = hi * 2

        const a0 = base + row
        const a1 = base + row + stationVerts
        const a2 = base + row + 2
        const a3 = base + row + stationVerts + 2
        indices.push(a0, a1, a2)
        indices.push(a2, a1, a3)

        const b0 = base + row + 1
        const b1 = base + row + stationVerts + 1
        const b2 = base + row + 3
        const b3 = base + row + stationVerts + 3
        indices.push(b0, b2, b1)
        indices.push(b2, b3, b1)
      }
    }

    // Bottom (keel)
    for (let si = 0; si < stations.length - 1; si++) {
      const base = si * stationVerts
      indices.push(base, base + 1, base + stationVerts)
      indices.push(base + 1, base + stationVerts + 1, base + stationVerts)
    }

    // Deck (top)
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
  }, [])

  const woodMat = useMemo(() => createWoodMaterial({
    baseColor: '#c8a878',
    darkColor: '#9a7850',
    lightColor: '#dcc098',
    grainDir: 0,
    plankScale: 0.6,
  }), [])

  return (
    <mesh geometry={geo} material={woodMat} castShadow>
      <Outlines thickness={0.02} color="#3a2010" />
    </mesh>
  )
}

// Hull width at a given Z position (shared by Deck and Walls)
const hullStations = [
  [-1.8, 0], [-1.5, 0.3], [-1.1, 0.7], [-0.8, 0.9],
  [-0.4, 1.0], [0, 1.0], [0.4, 1.0],
  [0.8, 0.9], [1.1, 0.7], [1.5, 0.3], [1.8, 0],
]
const hullWidth = 0.7

function getHullWidthAt(z) {
  for (let i = 0; i < hullStations.length - 1; i++) {
    const [z0, w0] = hullStations[i]
    const [z1, w1] = hullStations[i + 1]
    if (z >= z0 && z <= z1) {
      const t = (z - z0) / (z1 - z0)
      return (w0 + (w1 - w0) * t) * hullWidth
    }
  }
  return 0
}

// Deck — follows hull pointed shape
function Deck() {
  const g = useToonGradient()
  const geo = useMemo(() => {
    const vertices = []
    const colors = []
    const indices = []
    const light = new THREE.Color('#dab068')
    const dark = new THREE.Color('#c09050')

    // Build deck as a series of cross-sections following hull width
    const steps = 16
    for (let i = 0; i <= steps; i++) {
      const z = -1.7 + (3.4 * i) / steps
      const hw = getHullWidthAt(z) * 0.95 // slightly inset from hull edge
      const plank = Math.floor((z + 1.7) * 3) % 2
      const c = plank ? dark : light

      // port and starboard vertices
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
  }, [])

  const deckMat = useMemo(() => createWoodMaterial({
    baseColor: '#d4b888',
    darkColor: '#a88a60',
    lightColor: '#e8d0a8',
    grainDir: 1,
    plankScale: 4.0,
  }), [])

  return (
    <mesh geometry={geo} position={[0, 0.07, 0]} material={deckMat} castShadow>
      <Outlines thickness={0.012} color="#6a4820" />
    </mesh>
  )
}

// Walls — follow hull shape, tapering to points
function Walls() {
  const g = useToonGradient()

  const wallGeo = useMemo(() => {
    const vertices = []
    const colors = []
    const indices = []
    const light = new THREE.Color('#c89858')
    const dark = new THREE.Color('#a07840')
    const wallH = 0.36
    const steps = 16

    // Build one wall side as a ribbon following hull edge
    const buildSide = (sign) => {
      const offset = vertices.length / 3
      for (let i = 0; i <= steps; i++) {
        const z = -1.7 + (3.4 * i) / steps
        const hw = getHullWidthAt(z) * 0.95
        const x = sign * hw
        const plankBot = Math.floor(0 * 8) % 2
        const plankTop = Math.floor(1 * 8) % 2

        // Bottom vertex
        const cb = plankBot ? dark : light
        vertices.push(x, 0, z)
        colors.push(cb.r, cb.g, cb.b)

        // Top vertex
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

    buildSide(-1) // port
    buildSide(1)  // starboard

    const wallGeo = new THREE.BufferGeometry()
    wallGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    wallGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    wallGeo.setIndex(indices)
    wallGeo.computeVertexNormals()
    return wallGeo
  }, [])

  const wallMat = useMemo(() => createWoodMaterial({
    baseColor: '#c8a878',
    darkColor: '#9a7850',
    lightColor: '#dcc098',
    grainDir: 0,
    plankScale: 0.8,
  }), [])

  return (
    <group>
      <mesh geometry={wallGeo} position={[0, 0.07, 0]} material={wallMat} castShadow>
        <Outlines thickness={0.012} color="#3a2010" />
      </mesh>
      {/* Bowsprit decorative point */}
      <Toon color="#d4985a" position={[0, 0.15, 1.7]}>
        <coneGeometry args={[0.06, 0.4, 6]} />
      </Toon>
    </group>
  )
}

// Cabin — brighter, more cheerful
function Cabin() {
  const cabinY = 0.66

  const cabinGeo = useMemo(() => {
    return new THREE.BoxGeometry(0.9, 0.5, 1.65, 4, 8, 4)
  }, [])

  const cabinMat = useMemo(() => createWoodMaterial({
    baseColor: '#c8a878',
    darkColor: '#9a7a55',
    lightColor: '#dcc098',
    grainDir: 2,
    plankScale: 5.0,
  }), [])

  return (
    <group>
      <mesh geometry={cabinGeo} position={[0, cabinY, 0]} material={cabinMat} castShadow>
        <Outlines thickness={0.018} color="#3a2010" />
      </mesh>
      {/* Windows — brighter, more inviting */}
      {[-0.45, 0, 0.45].map((z, i) => (
        <group key={i}>
          <Toon color="#7a5030" position={[0.46, cabinY, z]} outline={false}>
            <boxGeometry args={[0.02, 0.22, 0.24]} />
          </Toon>
          <Toon color="#78b8d8" position={[0.47, cabinY, z]} outline={false}>
            <boxGeometry args={[0.01, 0.16, 0.18]} />
          </Toon>
          <Toon color="#7a5030" position={[-0.46, cabinY, z]} outline={false}>
            <boxGeometry args={[0.02, 0.22, 0.24]} />
          </Toon>
          <Toon color="#78b8d8" position={[-0.47, cabinY, z]} outline={false}>
            <boxGeometry args={[0.01, 0.16, 0.18]} />
          </Toon>
        </group>
      ))}
    </group>
  )
}

// Roof — red-orange, warm and inviting like AC houses
function Roof() {
  const g = useToonGradient()
  const geo = useMemo(() => {
    const roofGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.7, 14, 3, false, 0, Math.PI)
    const pos = roofGeo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const ridge = new THREE.Color('#c85a30')  // warm terracotta
    const eave = new THREE.Color('#a84420')

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const t = (y + 0.85) / 1.7
      const c = ridge.clone().lerp(eave, Math.abs(t - 0.5) * 2)
      c.toArray(colors, i * 3)
    }
    roofGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return roofGeo
  }, [])

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, Math.PI / 2, Math.PI]} position={[0, 0.91, 0]} castShadow>
      <meshToonMaterial vertexColors gradientMap={g} />
      <Outlines thickness={0.018} color="#5a2010" />
    </mesh>
  )
}

// Cute animals peeking — bigger eyes, rounder shapes
function Animals() {
  const cabinY = 0.66
  return (
    <group>
      {/* Giraffe — brighter yellow */}
      <group position={[0.5, cabinY + 0.08, -0.45]}>
        <Toon color="#ffd860" outlineColor="#a08020"><sphereGeometry args={[0.07, 8, 8]} /></Toon>
        <Toon color="#f0c850" outline={false} position={[-0.03, 0.07, 0]}><sphereGeometry args={[0.024, 6, 6]} /></Toon>
        <Toon color="#f0c850" outline={false} position={[0.03, 0.07, 0]}><sphereGeometry args={[0.024, 6, 6]} /></Toon>
        <Toon color="#daa840" outline={false} position={[-0.015, 0.1, 0]}><cylinderGeometry args={[0.007, 0.007, 0.06, 4]} /></Toon>
        <Toon color="#daa840" outline={false} position={[0.015, 0.1, 0]}><cylinderGeometry args={[0.007, 0.007, 0.06, 4]} /></Toon>
        {/* Big cute eyes */}
        <Toon color="#fff" outline={false} position={[-0.025, 0.02, 0.06]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.025, 0.02, 0.06]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[-0.025, 0.02, 0.075]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.025, 0.02, 0.075]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
        {/* Spots */}
        <Toon color="#e0a830" outline={false} position={[0.03, 0.0, 0.05]}><sphereGeometry args={[0.015, 4, 4]} /></Toon>
        <Toon color="#e0a830" outline={false} position={[-0.02, -0.03, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
      </group>
      {/* Cat — rounder, pinker nose */}
      <group position={[0.5, cabinY + 0.04, 0]}>
        <Toon color="#ffb060" outlineColor="#a06020"><sphereGeometry args={[0.065, 8, 8]} /></Toon>
        <Toon color="#ffb060" outline={false} position={[-0.038, 0.05, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.024, 0.048, 4]} /></Toon>
        <Toon color="#ffb060" outline={false} position={[0.038, 0.05, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.024, 0.048, 4]} /></Toon>
        {/* Big shiny eyes */}
        <Toon color="#fff" outline={false} position={[-0.022, 0.018, 0.055]}><sphereGeometry args={[0.017, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.022, 0.018, 0.055]}><sphereGeometry args={[0.017, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[-0.022, 0.018, 0.07]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.022, 0.018, 0.07]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
        {/* Pink nose */}
        <Toon color="#ff8888" outline={false} position={[0, 0.005, 0.065]}><sphereGeometry args={[0.008, 4, 4]} /></Toon>
      </group>
      {/* Bird — brighter blue */}
      <group position={[0.5, cabinY + 0.06, 0.45]}>
        <Toon color="#88d4ff" outlineColor="#4080c0"><sphereGeometry args={[0.065, 8, 8]} /></Toon>
        <Toon color="#ffda6e" outline={false} position={[0.06, -0.01, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.02, 0.045, 4]} /></Toon>
        {/* Big cute eyes */}
        <Toon color="#fff" outline={false} position={[-0.022, 0.025, 0.055]}><sphereGeometry args={[0.016, 6, 6]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.022, 0.025, 0.055]}><sphereGeometry args={[0.016, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[-0.022, 0.025, 0.068]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.022, 0.025, 0.068]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
        {/* Blush cheeks */}
        <Toon color="#ffaaaa" outline={false} position={[-0.04, 0.01, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
        <Toon color="#ffaaaa" outline={false} position={[0.04, 0.01, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
        {/* Wing */}
        <Toon color="#68c0f0" outline={false} position={[-0.04, 0.0, -0.03]} rotation={[0.3, 0.2, 0.5]}><boxGeometry args={[0.06, 0.01, 0.04]} /></Toon>
      </group>
    </group>
  )
}

// Deck animals — cute critters sitting on the deck
function DeckAnimals() {
  return (
    <group>
      {/* Turtle — sitting on stern deck */}
      <group position={[-0.3, 0.15, -1.0]}>
        {/* Shell */}
        <Toon color="#5ab870" outlineColor="#2a6830">
          <sphereGeometry args={[0.09, 8, 6]} />
        </Toon>
        {/* Shell pattern */}
        <Toon color="#48a060" outline={false} position={[0, 0.03, 0]}>
          <sphereGeometry args={[0.065, 6, 4]} />
        </Toon>
        {/* Head */}
        <Toon color="#78cc88" outline={false} position={[0.08, 0.03, 0]}>
          <sphereGeometry args={[0.04, 6, 6]} />
        </Toon>
        {/* Eyes */}
        <Toon color="#fff" outline={false} position={[0.11, 0.045, 0.02]}>
          <sphereGeometry args={[0.012, 4, 4]} />
        </Toon>
        <Toon color="#fff" outline={false} position={[0.11, 0.045, -0.02]}>
          <sphereGeometry args={[0.012, 4, 4]} />
        </Toon>
        <Toon color="#222" outline={false} position={[0.12, 0.045, 0.02]}>
          <sphereGeometry args={[0.006, 4, 4]} />
        </Toon>
        <Toon color="#222" outline={false} position={[0.12, 0.045, -0.02]}>
          <sphereGeometry args={[0.006, 4, 4]} />
        </Toon>
        {/* Blush */}
        <Toon color="#ffbbbb" outline={false} position={[0.1, 0.02, 0.04]}>
          <sphereGeometry args={[0.008, 4, 4]} />
        </Toon>
      </group>

      {/* Bunny — sitting on bow deck */}
      <group position={[0.25, 0.15, 1.1]}>
        {/* Body */}
        <Toon color="#fff0f0" outlineColor="#c0a0a0">
          <sphereGeometry args={[0.07, 8, 8]} />
        </Toon>
        {/* Head */}
        <Toon color="#fff0f0" outline={false} position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.055, 8, 8]} />
        </Toon>
        {/* Ears */}
        <Toon color="#fff0f0" outline={false} position={[-0.02, 0.16, 0]} rotation={[0, 0, 0.15]}>
          <capsuleGeometry args={[0.012, 0.06, 4, 4]} />
        </Toon>
        <Toon color="#fff0f0" outline={false} position={[0.02, 0.16, 0]} rotation={[0, 0, -0.15]}>
          <capsuleGeometry args={[0.012, 0.06, 4, 4]} />
        </Toon>
        {/* Inner ears (pink) */}
        <Toon color="#ffaaaa" outline={false} position={[-0.02, 0.16, 0.005]} rotation={[0, 0, 0.15]}>
          <capsuleGeometry args={[0.006, 0.04, 4, 4]} />
        </Toon>
        <Toon color="#ffaaaa" outline={false} position={[0.02, 0.16, 0.005]} rotation={[0, 0, -0.15]}>
          <capsuleGeometry args={[0.006, 0.04, 4, 4]} />
        </Toon>
        {/* Eyes */}
        <Toon color="#fff" outline={false} position={[-0.02, 0.09, 0.045]}>
          <sphereGeometry args={[0.014, 6, 6]} />
        </Toon>
        <Toon color="#fff" outline={false} position={[0.02, 0.09, 0.045]}>
          <sphereGeometry args={[0.014, 6, 6]} />
        </Toon>
        <Toon color="#222" outline={false} position={[-0.02, 0.09, 0.057]}>
          <sphereGeometry args={[0.008, 6, 6]} />
        </Toon>
        <Toon color="#222" outline={false} position={[0.02, 0.09, 0.057]}>
          <sphereGeometry args={[0.008, 6, 6]} />
        </Toon>
        {/* Pink nose */}
        <Toon color="#ff9090" outline={false} position={[0, 0.075, 0.055]}>
          <sphereGeometry args={[0.007, 4, 4]} />
        </Toon>
        {/* Tail */}
        <Toon color="#fff8f8" outline={false} position={[0, 0.0, -0.07]}>
          <sphereGeometry args={[0.025, 6, 6]} />
        </Toon>
      </group>

      {/* Frog — on the railing */}
      <group position={[0.6, 0.42, 0.5]}>
        {/* Body */}
        <Toon color="#68d868" outlineColor="#308830">
          <sphereGeometry args={[0.05, 8, 8]} />
        </Toon>
        {/* Big eyes on top */}
        <Toon color="#fff" outline={false} position={[-0.025, 0.045, 0.02]}>
          <sphereGeometry args={[0.018, 6, 6]} />
        </Toon>
        <Toon color="#fff" outline={false} position={[0.025, 0.045, 0.02]}>
          <sphereGeometry args={[0.018, 6, 6]} />
        </Toon>
        <Toon color="#222" outline={false} position={[-0.025, 0.045, 0.036]}>
          <sphereGeometry args={[0.009, 6, 6]} />
        </Toon>
        <Toon color="#222" outline={false} position={[0.025, 0.045, 0.036]}>
          <sphereGeometry args={[0.009, 6, 6]} />
        </Toon>
        {/* Blush */}
        <Toon color="#ff9090" outline={false} position={[-0.04, 0.02, 0.035]}>
          <sphereGeometry args={[0.01, 4, 4]} />
        </Toon>
        <Toon color="#ff9090" outline={false} position={[0.04, 0.02, 0.035]}>
          <sphereGeometry args={[0.01, 4, 4]} />
        </Toon>
      </group>
    </group>
  )
}

// Waving flag — brighter red
function Flag() {
  const flagRef = useRef()
  const g = useToonGradient()

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
      <Toon color="#5a3018" position={[0, 1.4, 0]} outlineColor="#2a1508">
        <cylinderGeometry args={[0.028, 0.038, 1.1, 6]} />
      </Toon>
      <mesh ref={flagRef} position={[0.2, 1.78, 0]}>
        <planeGeometry args={[0.4, 0.24, 8, 4]} />
        <meshToonMaterial color="#f04838" gradientMap={g} side={THREE.DoubleSide} />
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
