import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createOceanMaterial } from '../shaders/ocean'

// Stylized ocean with GPU-driven waves, caustics, and foam
export default function Ocean() {
  const meshRef = useRef()
  const matRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 120, 120)
    return geo
  }, [])

  const material = useMemo(() => createOceanMaterial(), [])

  useFrame(({ clock }) => {
    if (material) {
      material.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.4, 0]}
      geometry={geometry}
      material={material}
    />
  )
}
