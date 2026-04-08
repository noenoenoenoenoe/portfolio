import { useEffect, useState } from 'react'
import { useStore } from '../store'

export default function LoadingScreen() {
  const loaded = useStore((s) => s.loaded)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(timer)
    }
  }, [loaded])

  if (!visible) return null

  return (
    <div
      className={`
        absolute inset-0 z-50 flex flex-col items-center justify-center
        bg-gradient-to-b from-sky-900 to-blue-950
        transition-opacity duration-700
        ${loaded ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <div className="text-6xl mb-6 animate-bounce">
        &#x26F5;
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">
        L'Arche de Noé
      </h1>
      <p className="text-blue-300 text-sm animate-pulse">
        Mise a l'eau...
      </p>
    </div>
  )
}
