import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Single fluffy cloud made of overlapping white spheres
function Cloud({ position, scale = 1, speed = 0.1 }) {
  const groupRef = useRef()
  const startX = position[0]

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle drift
      groupRef.current.position.x = startX + Math.sin(clock.getElapsedTime() * speed) * 2
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * speed * 0.7 + 1) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main puffs — overlapping spheres */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 10, 8]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-1.0, -0.1, 0.2]}>
        <sphereGeometry args={[1.0, 10, 8]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.1, -0.15, -0.1]}>
        <sphereGeometry args={[0.95, 10, 8]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.5, 0.4, 0.1]}>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.5, 0.35, -0.15]}>
        <sphereGeometry args={[0.75, 10, 8]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-1.6, -0.3, 0]}>
        <sphereGeometry args={[0.65, 8, 6]} />
        <meshToonMaterial color="#f8f8ff" />
      </mesh>
      <mesh position={[1.7, -0.25, 0.15]}>
        <sphereGeometry args={[0.7, 8, 6]} />
        <meshToonMaterial color="#f8f8ff" />
      </mesh>
    </group>
  )
}

export default function CartoonClouds() {
  return (
    <group>
      <Cloud position={[-16, 10, -12]} scale={1.2} speed={0.08} />
      <Cloud position={[14, 12, 10]} scale={1.5} speed={0.06} />
      <Cloud position={[0, 11, -20]} scale={1.0} speed={0.1} />
      <Cloud position={[-8, 13, 16]} scale={0.9} speed={0.07} />
      <Cloud position={[22, 11, -5]} scale={1.3} speed={0.05} />
      <Cloud position={[-25, 12, 8]} scale={0.8} speed={0.09} />
      <Cloud position={[8, 14, -15]} scale={0.7} speed={0.11} />
    </group>
  )
}
