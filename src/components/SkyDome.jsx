import { useMemo } from 'react'
import * as THREE from 'three'
import { useTheme } from '../store'

export default function SkyDome() {
  const theme = useTheme()
  const { zenith: zenithHex, mid: midHex, horizon: horizonHex } = theme.sky

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(120, 32, 20)
    const colors = []
    const pos = geo.attributes.position

    const zenith = new THREE.Color(zenithHex)
    const mid = new THREE.Color(midHex)
    const horizon = new THREE.Color(horizonHex)
    const tmp = new THREE.Color()

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const t = (y / 120 + 1) * 0.5

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
  }, [zenithHex, midHex, horizonHex])

  return <mesh geometry={geometry} material={material} />
}
