import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import confetti from 'canvas-confetti'
import { useStore } from '../store'
import { playSplash, playCreak, playBell } from '../sounds'

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

function Toon({ color, children, outline = true, outlineColor = '#2a1505', outlineWidth = 0.02, ...props }) {
  const g = useToonGradient()
  return (
    <mesh {...props} castShadow>
      {children}
      <meshToonMaterial color={color} gradientMap={g} />
      {outline && <Outlines thickness={outlineWidth} color={outlineColor} />}
    </mesh>
  )
}

// Hull with organic shape using noise-displaced ExtrudeGeometry
function Hull() {
  const g = useToonGradient()
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    // Rounder, boat-like cross-section
    s.moveTo(-0.65, 0.05)
    s.quadraticCurveTo(-0.7, -0.2, -0.55, -0.45)
    s.quadraticCurveTo(-0.35, -0.65, 0, -0.7)
    s.quadraticCurveTo(0.35, -0.65, 0.55, -0.45)
    s.quadraticCurveTo(0.7, -0.2, 0.65, 0.05)
    s.lineTo(-0.65, 0.05)

    const extGeo = new THREE.ExtrudeGeometry(s, {
      depth: 3.0,
      bevelEnabled: true,
      bevelSize: 0.25,
      bevelThickness: 0.12,
      bevelSegments: 4,
    })
    extGeo.translate(0, 0, -1.5)

    // Vertex colors: darker below waterline, warmer above
    const pos = extGeo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const upper = new THREE.Color('#b87a40')
    const lower = new THREE.Color('#6b4225')
    const mid = new THREE.Color('#9a6535')

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      if (y > -0.1) {
        upper.toArray(colors, i * 3)
      } else if (y > -0.4) {
        mid.toArray(colors, i * 3)
      } else {
        lower.toArray(colors, i * 3)
      }
    }
    extGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    extGeo.computeVertexNormals()
    return extGeo
  }, [])

  return (
    <mesh geometry={geo} castShadow>
      <meshToonMaterial vertexColors gradientMap={g} />
      <Outlines thickness={0.025} color="#2a1505" />
    </mesh>
  )
}

// Deck with plank lines via vertex colors
function Deck() {
  const g = useToonGradient()
  const geo = useMemo(() => {
    const boxGeo = new THREE.BoxGeometry(1.25, 0.06, 2.9, 12, 1, 1)
    const pos = boxGeo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const light = new THREE.Color('#c49858')
    const dark = new THREE.Color('#a07840')

    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i)
      const plank = Math.floor((z + 1.5) * 3) % 2
      ;(plank ? dark : light).toArray(colors, i * 3)
    }
    boxGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return boxGeo
  }, [])

  return (
    <mesh geometry={geo} position={[0, 0.07, 0]} castShadow>
      <meshToonMaterial vertexColors gradientMap={g} />
      <Outlines thickness={0.015} color="#4a3010" />
    </mesh>
  )
}

// Walls with plank texture
function Walls() {
  const g = useToonGradient()
  const wallGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.08, 0.36, 2.7, 1, 6, 1)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const light = new THREE.Color('#b08045')
    const dark = new THREE.Color('#8a6030')
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const plank = Math.floor((y + 0.2) * 8) % 2
      ;(plank ? dark : light).toArray(colors, i * 3)
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <group>
      <mesh geometry={wallGeo} position={[-0.58, 0.28, 0]} castShadow>
        <meshToonMaterial vertexColors gradientMap={g} />
        <Outlines thickness={0.015} color="#2a1505" />
      </mesh>
      <mesh geometry={wallGeo} position={[0.58, 0.28, 0]} castShadow>
        <meshToonMaterial vertexColors gradientMap={g} />
        <Outlines thickness={0.015} color="#2a1505" />
      </mesh>
      <Toon color="#a07040" position={[0, 0.28, -1.3]}><boxGeometry args={[1.08, 0.36, 0.08]} /></Toon>
      <Toon color="#a07040" position={[0, 0.28, 1.3]}><boxGeometry args={[1.08, 0.36, 0.08]} /></Toon>
    </group>
  )
}

// Cabin
function Cabin() {
  const g = useToonGradient()
  const cabinY = 0.66

  const cabinGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.9, 0.5, 1.65, 1, 8, 1)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const light = new THREE.Color('#d4a558')
    const dark = new THREE.Color('#b08540')
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const plank = Math.floor((y + 0.3) * 8) % 2
      ;(plank ? dark : light).toArray(colors, i * 3)
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <group>
      <mesh geometry={cabinGeo} position={[0, cabinY, 0]} castShadow>
        <meshToonMaterial vertexColors gradientMap={g} />
        <Outlines thickness={0.02} color="#2a1505" />
      </mesh>
      {/* Windows */}
      {[-0.45, 0, 0.45].map((z, i) => (
        <group key={i}>
          {/* Window frame */}
          <Toon color="#5a3a18" position={[0.46, cabinY, z]} outline={false}>
            <boxGeometry args={[0.02, 0.22, 0.24]} />
          </Toon>
          {/* Window glass */}
          <Toon color="#1a2a3e" position={[0.47, cabinY, z]} outline={false}>
            <boxGeometry args={[0.01, 0.16, 0.18]} />
          </Toon>
          <Toon color="#5a3a18" position={[-0.46, cabinY, z]} outline={false}>
            <boxGeometry args={[0.02, 0.22, 0.24]} />
          </Toon>
          <Toon color="#1a2a3e" position={[-0.47, cabinY, z]} outline={false}>
            <boxGeometry args={[0.01, 0.16, 0.18]} />
          </Toon>
        </group>
      ))}
    </group>
  )
}

// Roof with vertex color gradient
function Roof() {
  const g = useToonGradient()
  const geo = useMemo(() => {
    const roofGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.7, 14, 3, false, 0, Math.PI)
    const pos = roofGeo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const ridge = new THREE.Color('#8a4a20')
    const eave = new THREE.Color('#6a3515')

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      // Y is along the length axis before rotation
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
      <Outlines thickness={0.02} color="#2a1505" />
    </mesh>
  )
}

// Animals peeking from windows
function Animals() {
  const cabinY = 0.66
  return (
    <group>
      {/* Giraffe */}
      <group position={[0.5, cabinY + 0.08, -0.45]}>
        <Toon color="#f0c850" outlineColor="#8a7020"><sphereGeometry args={[0.07, 8, 8]} /></Toon>
        <Toon color="#e0b040" outline={false} position={[-0.03, 0.07, 0]}><sphereGeometry args={[0.022, 6, 6]} /></Toon>
        <Toon color="#e0b040" outline={false} position={[0.03, 0.07, 0]}><sphereGeometry args={[0.022, 6, 6]} /></Toon>
        <Toon color="#c09030" outline={false} position={[-0.015, 0.1, 0]}><cylinderGeometry args={[0.007, 0.007, 0.06, 4]} /></Toon>
        <Toon color="#c09030" outline={false} position={[0.015, 0.1, 0]}><cylinderGeometry args={[0.007, 0.007, 0.06, 4]} /></Toon>
        {/* Spots */}
        <Toon color="#c09020" outline={false} position={[0.03, 0.0, 0.05]}><sphereGeometry args={[0.015, 4, 4]} /></Toon>
        <Toon color="#c09020" outline={false} position={[-0.02, -0.03, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
      </group>
      {/* Cat */}
      <group position={[0.5, cabinY + 0.04, 0]}>
        <Toon color="#ff9f43" outlineColor="#8a5020"><sphereGeometry args={[0.06, 8, 8]} /></Toon>
        <Toon color="#ff9f43" outline={false} position={[-0.035, 0.05, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.022, 0.045, 4]} /></Toon>
        <Toon color="#ff9f43" outline={false} position={[0.035, 0.05, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.022, 0.045, 4]} /></Toon>
        {/* Eyes */}
        <Toon color="#222" outline={false} position={[-0.02, 0.015, 0.05]}><sphereGeometry args={[0.012, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.02, 0.015, 0.05]}><sphereGeometry args={[0.012, 6, 6]} /></Toon>
      </group>
      {/* Bird */}
      <group position={[0.5, cabinY + 0.06, 0.45]}>
        <Toon color="#74c0ff" outlineColor="#3060a0"><sphereGeometry args={[0.06, 8, 8]} /></Toon>
        <Toon color="#fdcb6e" outline={false} position={[0.06, -0.01, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.02, 0.045, 4]} /></Toon>
        {/* Eyes */}
        <Toon color="#222" outline={false} position={[-0.02, 0.025, 0.05]}><sphereGeometry args={[0.012, 6, 6]} /></Toon>
        <Toon color="#222" outline={false} position={[0.02, 0.025, 0.05]}><sphereGeometry args={[0.012, 6, 6]} /></Toon>
        {/* Wing */}
        <Toon color="#5aabee" outline={false} position={[-0.04, 0.0, -0.03]} rotation={[0.3, 0.2, 0.5]}><boxGeometry args={[0.06, 0.01, 0.04]} /></Toon>
      </group>
    </group>
  )
}

// Waving flag
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
    <group position={[0, 0, -0.5]}>
      <Toon color="#3d2010" position={[0, 1.4, 0]} outlineColor="#1a1005">
        <cylinderGeometry args={[0.028, 0.038, 1.1, 6]} />
      </Toon>
      <mesh ref={flagRef} position={[0.2, 1.78, 0]}>
        <planeGeometry args={[0.4, 0.24, 8, 4]} />
        <meshToonMaterial color="#e04030" gradientMap={g} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function Ark() {
  const groupRef = useRef()
  const arkTarget = useStore((s) => s.arkTarget)
  const setArkMoving = useStore((s) => s.setArkMoving)

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
        // Confetti burst on arrival
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f0d8a0', '#4cad50', '#74c0ff', '#ff9f43', '#e04030'],
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
      <Hull />
      <Deck />
      <Walls />
      <Cabin />
      <Roof />
      <Animals />
      <Flag />
    </group>
  )
}
