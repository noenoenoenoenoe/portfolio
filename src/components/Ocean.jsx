import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTheme } from '../store'
import { createOceanMaterial } from '../shaders/ocean'

export default function Ocean() {
  const meshRef = useRef()
  const theme = useTheme()
  const o = theme.ocean

  const geometry = useMemo(() => new THREE.PlaneGeometry(300, 300, 120, 120), [])

  const material = useMemo(
    () => createOceanMaterial({
      deep: o.deep,
      mid: o.mid,
      shallow: o.shallow,
      foam: o.foam,
      waveHeight: o.waveHeight,
      waveSpeed: o.waveSpeed,
      causticIntensity: o.causticIntensity,
      sparkleIntensity: o.sparkleIntensity,
      toonBanding: o.toonBanding,
      specularSun: o.specularSun,
    }),
    [o.deep, o.mid, o.shallow, o.foam, o.waveHeight, o.waveSpeed,
     o.causticIntensity, o.sparkleIntensity, o.toonBanding, o.specularSun]
  )

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
