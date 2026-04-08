import Island from './Island'
import { islands } from '../data/islands'

export default function IslandCluster() {
  return (
    <group>
      {islands.map((island, i) => (
        <Island key={island.id} data={island} index={i} />
      ))}
    </group>
  )
}
