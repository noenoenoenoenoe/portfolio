import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { skills as allSkills } from '../data/islands'

const keyframes = `
@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.info-panel-scroll::-webkit-scrollbar {
  width: 8px;
}
.info-panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.info-panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(180, 130, 60, 0.3);
  border-radius: 4px;
}
.info-panel-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(180, 130, 60, 0.5);
}
`

// Monogram from a project name: "Le Velo Marseille" -> "LV"
function monogram(name) {
  const clean = name.split('—')[0].split('-')[0].trim()
  const words = clean.split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w[0]))
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}

// Generated thumbnail / cover for a project (zero-asset). Captain shows their avatar.
function ProjectCover({ island }) {
  if (island.id === 'captain') {
    return (
      <div style={{
        height: '150px',
        background: `radial-gradient(circle at 50% 35%, ${island.color}33, rgba(10,8,5,0.6))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <img
          src={`${import.meta.env.BASE_URL}${island.avatar}`}
          alt="Avatar du Capitaine"
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            border: `3px solid ${island.color}`,
            boxShadow: `0 6px 24px rgba(0,0,0,0.45)`,
            objectFit: 'cover',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    )
  }
  return (
    <div style={{
      position: 'relative',
      height: '128px',
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${island.color} 0%, ${island.color}99 45%, rgba(20,16,10,0.9) 100%)`,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* decorative bubbles */}
      <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '10px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(0,0,0,0.12)' }} />
      <span style={{
        fontSize: '64px',
        fontWeight: 900,
        color: 'rgba(255,255,255,0.92)',
        textShadow: '0 3px 14px rgba(0,0,0,0.35)',
        letterSpacing: '2px',
        fontFamily: 'Inter, sans-serif',
      }}>
        {monogram(island.name)}
      </span>
      <span style={{
        position: 'absolute',
        bottom: '10px',
        left: '14px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.85)',
        background: 'rgba(0,0,0,0.25)',
        padding: '3px 8px',
        borderRadius: '6px',
        backdropFilter: 'blur(4px)',
      }}>
        {island.techStack?.[0] || 'Projet'}
      </span>
    </div>
  )
}

// Event photo gallery — missing files are hidden gracefully.
function Gallery({ images }) {
  const [loaded, setLoaded] = useState({})
  const anyLoaded = Object.values(loaded).some(Boolean)
  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{
        fontSize: '11px', fontWeight: 700, color: '#7a6a50',
        textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px',
      }}>
        📸 Photos de l'événement
      </h3>
      {!anyLoaded && (
        <p style={{ color: '#7a6a50', fontSize: '12px', fontStyle: 'italic', margin: '0 0 10px' }}>
          Photos bientôt en ligne.
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {images.map((src, i) => (
          <img
            key={src}
            src={`${import.meta.env.BASE_URL}${src}`}
            alt={`Hackathon Mirakl ${i + 1}`}
            loading="lazy"
            onLoad={() => setLoaded((l) => ({ ...l, [src]: true }))}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              objectFit: 'cover',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: loaded[src] ? 'block' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}

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
  const panelRef = useRef(null)

  // Re-trigger animations when island changes
  useEffect(() => {
    if (selectedIsland) setKey((k) => k + 1)
  }, [selectedIsland?.id])

  const handleClose = () => {
    setPanelOpen(false)
    setSelectedIsland(null)
  }

  // Close on click outside and on Escape key
  useEffect(() => {
    if (!panelOpen) return

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false)
        setSelectedIsland(null)
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setPanelOpen(false)
        setSelectedIsland(null)
      }
    }

    // Delay attachment to avoid catching the same click that opened the panel
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    document.addEventListener('keydown', handleEscape)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [panelOpen, setPanelOpen, setSelectedIsland])

  // Get skill details for this island
  const islandSkills = selectedIsland
    ? selectedIsland.skills
        .map((id) => allSkills.find((s) => s.id === id))
        .filter(Boolean)
    : []

  return (
    <>
      <style>{keyframes}</style>
      <div ref={panelRef} className="info-panel-scroll" style={{
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
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}>
        {selectedIsland && (
          <div key={key}>
            {/* Generated cover / avatar */}
            <ProjectCover island={selectedIsland} />
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
                  whiteSpace: 'pre-line',
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

              {/* Event photo gallery */}
              {selectedIsland.gallery?.length > 0 && (
                <AnimatedItem delay={0.35}>
                  <Gallery images={selectedIsland.gallery} />
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
                {selectedIsland.confidential && !selectedIsland.github && !selectedIsland.demo && (
                  <div style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#a89878',
                    letterSpacing: '0.3px',
                  }}>
                    {selectedIsland.confidentialLabel || '🔒 Projet pro — code confidentiel'}
                  </div>
                )}
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
                    {selectedIsland.demoLabel || 'Demo Live'}
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
