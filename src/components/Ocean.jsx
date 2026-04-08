import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Ocean() {
  const meshRef = useRef()

  // We need a non-indexed geometry for flat shading to work properly
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 80, 80)
    geo.deleteAttribute('uv')
    const nonIndexed = geo.toNonIndexed()
    nonIndexed.computeVertexNormals()
    return nonIndexed
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const pos = meshRef.current.geometry.attributes.position
    const colors = meshRef.current.geometry.attributes.color

    const deep = new THREE.Color('#0e6e8f')
    const mid = new THREE.Color('#1a9dbd')
    const shallow = new THREE.Color('#5ac8db')

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getY(i) // Y in plane space = Z in world

      const height =
        Math.sin(x * 0.12 + t * 0.7) * 0.25 +
        Math.sin(z * 0.1 + t * 0.5) * 0.18 +
        Math.sin((x + z) * 0.08 + t * 0.4) * 0.12

      pos.setZ(i, height)

      // Color based on height
      const factor = (height + 0.55) / 1.1 // normalize to 0-1
      const color = factor > 0.5
        ? mid.clone().lerp(shallow, (factor - 0.5) * 2)
        : deep.clone().lerp(mid, factor * 2)

      colors.setXYZ(i, color.r, color.g, color.b)
    }

    pos.needsUpdate = true
    colors.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  // Initialize vertex colors
  const colorAttr = useMemo(() => {
    const count = geometry.attributes.position.count
    const colors = new Float32Array(count * 3)
    colors.fill(0.1)
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geometry.attributes.color
  }, [geometry])

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} geometry={geometry}>
      <meshToonMaterial vertexColors flatShading />
    </mesh>
  )
}
