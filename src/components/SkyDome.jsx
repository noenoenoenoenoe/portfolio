import { useMemo } from 'react'
import * as THREE from 'three'

export default function SkyDome() {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(120, 32, 20)
    const colors = []
    const pos = geo.attributes.position

    // Pastel gradient: warm peach horizon → soft blue zenith
    const zenith = new THREE.Color('#7ec8e3')   // soft sky blue
    const mid = new THREE.Color('#b8e4f0')      // light pastel blue
    const horizon = new THREE.Color('#ffe5c4')   // warm peach
    const tmp = new THREE.Color()

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const t = (y / 120 + 1) * 0.5 // 0 at bottom, 1 at top

      if (t < 0.35) {
        tmp.copy(horizon).lerp(mid, t / 0.35)
      } else {
        tmp.copy(mid).lerp(zenith, (t - 0.35) / 0.65)
      }
      colors.push(tmp.r, tmp.g, tmp.b)
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      fog: false,
    })

    return { geometry: geo, material: mat }
  }, [])

  return <mesh geometry={geometry} material={material} />
}
