import { useStore } from '../store'

const navLinkStyle = {
  padding: '8px 16px',
  background: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(6px)',
  color: 'white',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: 'Inter, sans-serif',
  textDecoration: 'none',
}

export default function Navbar() {
  const setSelectedIsland = useStore((s) => s.setSelectedIsland)
  const setPanelOpen = useStore((s) => s.setPanelOpen)

  const handleTitleClick = () => {
    setSelectedIsland(null)
    setPanelOpen(false)
  }

  return (
    <nav style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
    }}>
      <button
        onClick={handleTitleClick}
        style={{
          background: 'linear-gradient(135deg, rgba(180,120,50,0.85), rgba(140,80,25,0.9))',
          border: '2px solid rgba(220,170,80,0.5)',
          color: '#ffe8b0',
          fontSize: '20px',
          fontWeight: 800,
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          padding: '10px 22px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
          letterSpacing: '0.5px',
        }}
      >
        &#x26F5; L'Arche de No&eacute;
      </button>
      <div style={{ display: 'flex', gap: '10px' }}>
        <a
          href="https://github.com/noenoenoenoenoe"
          target="_blank"
          rel="noopener noreferrer"
          style={navLinkStyle}
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/escoffiervincentnoe/"
          target="_blank"
          rel="noopener noreferrer"
          style={navLinkStyle}
        >
          LinkedIn
        </a>
        <a
          href="mailto:noe.vincent8@gmail.com"
          style={navLinkStyle}
        >
          Contact
        </a>
      </div>
    </nav>
  )
}
