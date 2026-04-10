import { useStore } from '../store'
import { themeList } from '../themes'

export default function ThemeSwitcher() {
  const themeId = useStore((s) => s.themeId)
  const setThemeId = useStore((s) => s.setThemeId)

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex',
      gap: 6,
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      padding: '6px 10px',
      border: '1px solid rgba(255,255,255,0.12)',
    }}>
      {themeList.map((t) => {
        const active = t.id === themeId
        return (
          <button
            key={t.id}
            onClick={() => setThemeId(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              border: active ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
              background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
          >
            {t.icon} {t.name}
          </button>
        )
      })}
    </div>
  )
}
