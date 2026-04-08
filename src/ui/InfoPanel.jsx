import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { skills as allSkills } from '../data/islands'

const keyframes = `
@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
`

function AnimatedItem({ delay = 0, children }) {
  return (
    <div style={{
      animation: `slideUp 0.4s ease-out ${delay}s both`,
    }}>
      {children}
    </div>
  )
}

export default function InfoPanel() {
  const selectedIsland = useStore((s) => s.selectedIsland)
  const panelOpen = useStore((s) => s.panelOpen)
  const setPanelOpen = useStore((s) => s.setPanelOpen)
  const setSelectedIsland = useStore((s) => s.setSelectedIsland)
  const [key, setKey] = useState(0)

  // Re-trigger animations when island changes
  useEffect(() => {
    if (selectedIsland) setKey((k) => k + 1)
  }, [selectedIsland?.id])

  const handleClose = () => {
    setPanelOpen(false)
    setSelectedIsland(null)
  }

  // Get skill details for this island
  const islandSkills = selectedIsland
    ? selectedIsland.skills
        .map((id) => allSkills.find((s) => s.id === id))
        .filter(Boolean)
    : []

  return (
    <>
      <style>{keyframes}</style>
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 20,
        width: '380px',
        maxWidth: '92vw',
        background: 'linear-gradient(180deg, rgba(15, 12, 8, 0.95) 0%, rgba(25, 20, 12, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        color: 'white',
        transform: panelOpen && selectedIsland ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        borderLeft: '3px solid rgba(180, 130, 60, 0.4)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
      }}>
        {selectedIsland && (
          <div key={key}>
            {/* Header */}
            <div style={{
              padding: '28px 24px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(180, 130, 60, 0.08)',
            }}>
              <AnimatedItem delay={0}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Color dot */}
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: selectedIsland.color,
                      boxShadow: `0 0 10px ${selectedIsland.color}60`,
                      flexShrink: 0,
                    }} />
                    <h2 style={{
                      margin: 0,
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#f0d8a0',
                      lineHeight: 1.2,
                    }}>
                      {selectedIsland.name}
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    style={{
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#aaa',
                      fontSize: '20px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.15)'
                      e.target.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.08)'
                      e.target.style.color = '#aaa'
                    }}
                  >
                    &times;
                  </button>
                </div>
              </AnimatedItem>

              {/* Tech stack badges */}
              <AnimatedItem delay={0.1}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedIsland.techStack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(180, 130, 60, 0.2)',
                        border: '1px solid rgba(180, 130, 60, 0.25)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#e8d0a0',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </AnimatedItem>
            </div>

            {/* Description */}
            <div style={{ padding: '24px', flex: 1 }}>
              <AnimatedItem delay={0.2}>
                <p style={{
                  color: '#b8a888',
                  lineHeight: 1.8,
                  fontSize: '14px',
                  margin: 0,
                }}>
                  {selectedIsland.description}
                </p>
              </AnimatedItem>

              {/* Skills section */}
              {islandSkills.length > 0 && (
                <AnimatedItem delay={0.3}>
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#7a6a50',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      marginBottom: '12px',
                    }}>
                      Competences
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {islandSkills.map((skill) => (
                        <div
                          key={skill.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        >
                          <span>{skill.icon}</span>
                          <span style={{ color: '#c8b898' }}>{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedItem>
              )}
            </div>

            {/* Links */}
            <AnimatedItem delay={0.4}>
              <div style={{
                padding: '20px 24px 24px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
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
                      background: 'linear-gradient(135deg, rgba(180, 130, 60, 0.25), rgba(180, 130, 60, 0.15))',
                      border: '1px solid rgba(180, 130, 60, 0.3)',
                      borderRadius: '10px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#f0d8a0',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(180, 130, 60, 0.35)'}
                    onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, rgba(180, 130, 60, 0.25), rgba(180, 130, 60, 0.15))'}
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
                      background: 'linear-gradient(135deg, #4a90d9, #3a70b0)',
                      borderRadius: '10px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'white',
                      textDecoration: 'none',
                    }}
                  >
                    Demo Live
                  </a>
                )}
              </div>
            </AnimatedItem>
          </div>
        )}
      </div>
    </>
  )
}
