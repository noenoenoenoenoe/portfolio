import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

function fireConfetti() {
  const end = Date.now() + 1200
  const colors = ['#f0d8a0', '#5b9bd5', '#ff6b00', '#c5d96c', '#b5a8d0']
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

export default function EasterEggs() {
  const [toast, setToast] = useState(null)

  // Console easter egg for the curious
  useEffect(() => {
    console.log(
      '%c⛵ Tu fouilles dans la console ? Bien joué.',
      'font-size:16px;font-weight:bold;color:#f0d8a0',
    )
    console.log(
      "%cIndice : essaie le code Konami sur la page (↑ ↑ ↓ ↓ ← → ← → B A). Et écris-moi : nescoffier@eugeniaschool.com",
      'font-size:12px;color:#5b9bd5',
    )
  }, [])

  // Konami code listener
  useEffect(() => {
    let pos = 0
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === KONAMI[pos]) {
        pos++
        if (pos === KONAMI.length) {
          pos = 0
          fireConfetti()
          setToast('🎉 Easter egg débloqué — bienvenue dans l’équipage !')
          setTimeout(() => setToast(null), 4000)
        }
      } else {
        pos = key === KONAMI[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!toast) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      padding: '12px 22px',
      background: 'linear-gradient(135deg, rgba(180,120,50,0.95), rgba(140,80,25,0.95))',
      border: '2px solid rgba(220,170,80,0.6)',
      borderRadius: '14px',
      color: '#ffe8b0',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 700,
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.4s ease-out both',
    }}>
      {toast}
    </div>
  )
}
