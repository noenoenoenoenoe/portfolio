import { useEffect, useState } from 'react'
import { useStore } from '../store'

const keyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes wave {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
`

export default function LoadingScreen() {
  const loaded = useStore((s) => s.loaded)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => setVisible(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [loaded])

  if (!visible) return null

  return (
    <>
      <style>{keyframes}</style>
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0a2a4a 0%, #0d3d6b 40%, #1a5a8a 100%)',
        opacity: loaded ? 0 : 1,
        transition: 'opacity 1s ease-out',
        fontFamily: 'Inter, sans-serif',
      }}>
        {/* Waves background decoration */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(26, 143, 180, 0.3) 100%)',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: 0,
            width: '200%',
            height: '40px',
            background: 'rgba(26, 143, 180, 0.2)',
            borderRadius: '50%',
            animation: 'wave 4s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: 0,
            width: '200%',
            height: '30px',
            background: 'rgba(26, 143, 180, 0.15)',
            borderRadius: '50%',
            animation: 'wave 3s linear infinite',
            animationDelay: '-1s',
          }} />
        </div>

        {/* Ark emoji */}
        <div style={{
          fontSize: '64px',
          marginBottom: '24px',
          animation: 'float 2s ease-in-out infinite',
          animationDelay: '0.2s',
        }}>
          &#x26F5;
        </div>

        {/* Title */}
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f0d8a0, #d4a050)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          animation: 'fadeIn 0.8s ease-out',
          letterSpacing: '1px',
        }}>
          L'Arche de No&eacute;
        </h1>

        {/* Subtitle */}
        <p style={{
          marginTop: '12px',
          fontSize: '14px',
          color: '#6ab0d4',
          fontWeight: 500,
          animation: 'pulse 1.5s ease-in-out infinite',
          letterSpacing: '2px',
        }}>
          Mise &agrave; l'eau...
        </p>

        {/* Progress bar */}
        <div style={{
          marginTop: '32px',
          width: '160px',
          height: '3px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '40%',
            height: '100%',
            background: 'linear-gradient(90deg, #f0d8a0, #d4a050)',
            borderRadius: '2px',
            animation: 'wave 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>
    </>
  )
}
