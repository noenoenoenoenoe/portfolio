import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Seagull({ offset = 0, radius = 18, height = 6, speed = 0.15 }) {
  const groupRef = useRef()
  const wingRef1 = useRef()
  const wingRef2 = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset
    // Circular flight path
    groupRef.current.position.x = Math.sin(t) * radius
    groupRef.current.position.z = Math.cos(t) * radius
    groupRef.current.position.y = height + Math.sin(t * 3) * 0.5

    // Face direction of travel
    groupRef.current.rotation.y = t + Math.PI / 2

    // Wing flap
    const flap = Math.sin(clock.getElapsedTime() * 6 + offset * 10) * 0.4
    if (wingRef1.current) wingRef1.current.rotation.z = flap + 0.2
    if (wingRef2.current) wingRef2.current.rotation.z = -flap - 0.2
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshToonMaterial color="#f0f0f0" />
      </mesh>
      {/* Head */}
      <mesh position={[0.12, 0.05, 0]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshToonMaterial color="#f5f5f5" />
      </mesh>
      {/* Beak */}
      <mesh position={[0.2, 0.02, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.02, 0.08, 4]} />
        <meshToonMaterial color="#f0a030" />
      </mesh>
      {/* Left wing */}
      <mesh ref={wingRef1} position={[0, 0.02, 0.12]}>
        <boxGeometry args={[0.15, 0.015, 0.25]} />
        <meshToonMaterial color="#e8e8e8" />
      </mesh>
      {/* Right wing */}
      <mesh ref={wingRef2} position={[0, 0.02, -0.12]}>
        <boxGeometry args={[0.15, 0.015, 0.25]} />
        <meshToonMaterial color="#e8e8e8" />
      </mesh>
    </group>
  )
}

export default function Seagulls() {
  return (
    <group>
      <Seagull offset={0} radius={16} height={6} speed={0.12} />
      <Seagull offset={2.1} radius={20} height={7} speed={0.09} />
      <Seagull offset={4.2} radius={14} height={5.5} speed={0.14} />
      <Seagull offset={1.0} radius={22} height={8} speed={0.07} />
      <Seagull offset={3.5} radius={12} height={5} speed={0.16} />
    </group>
  )
}
