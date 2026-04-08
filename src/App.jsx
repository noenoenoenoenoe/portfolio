import Scene from './components/Scene'
import Navbar from './ui/Navbar'
import InfoPanel from './ui/InfoPanel'
import './index.css'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene />
      <Navbar />
      <InfoPanel />
    </div>
  )
}
