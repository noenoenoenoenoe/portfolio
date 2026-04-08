import { useStore } from '../store'

export default function InfoPanel() {
  const selectedIsland = useStore((s) => s.selectedIsland)
  const panelOpen = useStore((s) => s.panelOpen)
  const setPanelOpen = useStore((s) => s.setPanelOpen)
  const setSelectedIsland = useStore((s) => s.setSelectedIsland)

  const handleClose = () => {
    setPanelOpen(false)
    setSelectedIsland(null)
  }

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 20,
      width: '360px',
      maxWidth: '90vw',
      background: 'rgba(20, 15, 10, 0.92)',
      backdropFilter: 'blur(12px)',
      color: 'white',
      transform: panelOpen && selectedIsland ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.4s ease-out',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      borderLeft: '3px solid rgba(180, 130, 60, 0.4)',
    }}>
      {selectedIsland && (
        <>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f0d8a0' }}>
                {selectedIsland.name}
              </h2>
              <button
                onClick={handleClose}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedIsland.techStack.map((tech) => (
                <span
                  key={tech}
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(180, 130, 60, 0.25)',
                    border: '1px solid rgba(180, 130, 60, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#e8d0a0',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ padding: '24px', flex: 1 }}>
            <p style={{ color: '#c0b090', lineHeight: 1.7, fontSize: '14px', margin: 0 }}>
              {selectedIsland.description}
            </p>
          </div>

          {/* Links */}
          <div style={{
            padding: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '10px',
          }}>
            {selectedIsland.github && (
              <a
                href={selectedIsland.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(180, 130, 60, 0.2)',
                  border: '1px solid rgba(180, 130, 60, 0.3)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#f0d8a0',
                  textDecoration: 'none',
                }}
              >
                Voir sur GitHub
              </a>
            )}
            {selectedIsland.demo && (
              <a
                href={selectedIsland.demo}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4a90d9',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'white',
                  textDecoration: 'none',
                }}
              >
                Demo Live
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}
