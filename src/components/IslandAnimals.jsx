import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'

function Toon({ color, children, outline = true, outlineColor = '#333', outlineWidth = 0.008, ...props }) {
  return (
    <mesh {...props}>
      {children}
      <meshToonMaterial color={color} />
      {outline && <Outlines thickness={outlineWidth} color={outlineColor} />}
    </mesh>
  )
}

// Cute fox sitting
function Fox({ position }) {
  const tailRef = useRef()
  useFrame(({ clock }) => {
    if (tailRef.current) tailRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.2 - 0.3
  })
  return (
    <group position={position}>
      {/* Body */}
      <Toon color="#e87830" outlineColor="#884420"><sphereGeometry args={[0.15, 8, 8]} /></Toon>
      {/* Head */}
      <Toon color="#f08838" outlineColor="#884420" position={[0, 0.15, 0.1]}>
        <sphereGeometry args={[0.11, 8, 8]} />
      </Toon>
      {/* Ears */}
      <Toon color="#f08838" outline={false} position={[-0.06, 0.28, 0.1]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.035, 0.08, 4]} />
      </Toon>
      <Toon color="#f08838" outline={false} position={[0.06, 0.28, 0.1]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.035, 0.08, 4]} />
      </Toon>
      {/* Inner ears */}
      <Toon color="#ffaa60" outline={false} position={[-0.06, 0.27, 0.115]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.018, 0.05, 4]} />
      </Toon>
      <Toon color="#ffaa60" outline={false} position={[0.06, 0.27, 0.115]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.018, 0.05, 4]} />
      </Toon>
      {/* Snout */}
      <Toon color="#fff0e0" outline={false} position={[0, 0.11, 0.18]}>
        <sphereGeometry args={[0.05, 6, 6]} />
      </Toon>
      {/* Nose */}
      <Toon color="#222" outline={false} position={[0, 0.13, 0.22]}>
        <sphereGeometry args={[0.015, 4, 4]} />
      </Toon>
      {/* Eyes */}
      <Toon color="#fff" outline={false} position={[-0.04, 0.19, 0.17]}><sphereGeometry args={[0.02, 6, 6]} /></Toon>
      <Toon color="#fff" outline={false} position={[0.04, 0.19, 0.17]}><sphereGeometry args={[0.02, 6, 6]} /></Toon>
      <Toon color="#222" outline={false} position={[-0.04, 0.19, 0.188]}><sphereGeometry args={[0.012, 6, 6]} /></Toon>
      <Toon color="#222" outline={false} position={[0.04, 0.19, 0.188]}><sphereGeometry args={[0.012, 6, 6]} /></Toon>
      {/* Tail */}
      <group ref={tailRef} position={[0, 0.05, -0.15]}>
        <Toon color="#e87830" outline={false}><sphereGeometry args={[0.06, 6, 6]} /></Toon>
        <Toon color="#fff0e0" outline={false} position={[0, -0.02, -0.04]}><sphereGeometry args={[0.03, 6, 6]} /></Toon>
      </group>
    </group>
  )
}

// Penguin standing
function Penguin({ position }) {
  const bodyRef = useRef()
  useFrame(({ clock }) => {
    if (bodyRef.current) bodyRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.05
  })
  return (
    <group position={position} ref={bodyRef}>
      {/* Body */}
      <Toon color="#2a2a3a" outlineColor="#111"><sphereGeometry args={[0.12, 8, 8]} /></Toon>
      {/* Belly */}
      <Toon color="#f0f0f0" outline={false} position={[0, -0.02, 0.06]}>
        <sphereGeometry args={[0.08, 8, 8]} />
      </Toon>
      {/* Head */}
      <Toon color="#2a2a3a" outline={false} position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
      </Toon>
      {/* Eyes */}
      <Toon color="#fff" outline={false} position={[-0.03, 0.17, 0.06]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
      <Toon color="#fff" outline={false} position={[0.03, 0.17, 0.06]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
      <Toon color="#222" outline={false} position={[-0.03, 0.17, 0.076]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
      <Toon color="#222" outline={false} position={[0.03, 0.17, 0.076]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
      {/* Beak */}
      <Toon color="#f0a030" outline={false} position={[0, 0.14, 0.08]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.02, 0.04, 4]} />
      </Toon>
      {/* Blush */}
      <Toon color="#ffaaaa" outline={false} position={[-0.06, 0.14, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
      <Toon color="#ffaaaa" outline={false} position={[0.06, 0.14, 0.05]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
      {/* Flippers */}
      <Toon color="#2a2a3a" outline={false} position={[-0.12, 0.02, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.04, 0.1, 0.03]} />
      </Toon>
      <Toon color="#2a2a3a" outline={false} position={[0.12, 0.02, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.04, 0.1, 0.03]} />
      </Toon>
      {/* Feet */}
      <Toon color="#f0a030" outline={false} position={[-0.04, -0.12, 0.04]}>
        <boxGeometry args={[0.04, 0.015, 0.05]} />
      </Toon>
      <Toon color="#f0a030" outline={false} position={[0.04, -0.12, 0.04]}>
        <boxGeometry args={[0.04, 0.015, 0.05]} />
      </Toon>
    </group>
  )
}

// Owl perched
function Owl({ position }) {
  const eyeRef = useRef()
  useFrame(({ clock }) => {
    // Occasional blink
    const t = clock.getElapsedTime()
    const blink = Math.sin(t * 0.5) > 0.98 ? 0.1 : 1
    if (eyeRef.current) eyeRef.current.scale.y = blink
  })
  return (
    <group position={position}>
      {/* Body */}
      <Toon color="#8B6E50" outlineColor="#5a4030"><sphereGeometry args={[0.12, 8, 8]} /></Toon>
      {/* Head */}
      <Toon color="#9B7E60" outline={false} position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
      </Toon>
      {/* Belly */}
      <Toon color="#d8c8a8" outline={false} position={[0, -0.02, 0.06]}>
        <sphereGeometry args={[0.07, 6, 6]} />
      </Toon>
      {/* Ear tufts */}
      <Toon color="#7a5e40" outline={false} position={[-0.06, 0.24, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.02, 0.06, 4]} />
      </Toon>
      <Toon color="#7a5e40" outline={false} position={[0.06, 0.24, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.02, 0.06, 4]} />
      </Toon>
      {/* Eyes — big round owl eyes */}
      <group ref={eyeRef}>
        <Toon color="#fff" outline={false} position={[-0.04, 0.17, 0.07]}><sphereGeometry args={[0.03, 8, 8]} /></Toon>
        <Toon color="#fff" outline={false} position={[0.04, 0.17, 0.07]}><sphereGeometry args={[0.03, 8, 8]} /></Toon>
      </group>
      <Toon color="#ff8800" outline={false} position={[-0.04, 0.17, 0.095]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
      <Toon color="#ff8800" outline={false} position={[0.04, 0.17, 0.095]}><sphereGeometry args={[0.018, 6, 6]} /></Toon>
      <Toon color="#111" outline={false} position={[-0.04, 0.17, 0.11]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
      <Toon color="#111" outline={false} position={[0.04, 0.17, 0.11]}><sphereGeometry args={[0.01, 6, 6]} /></Toon>
      {/* Beak */}
      <Toon color="#dda030" outline={false} position={[0, 0.13, 0.1]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.015, 0.03, 4]} />
      </Toon>
      {/* Wings */}
      <Toon color="#7a5e40" outline={false} position={[-0.11, 0.02, -0.02]} rotation={[0.2, 0, 0.4]}>
        <boxGeometry args={[0.04, 0.12, 0.06]} />
      </Toon>
      <Toon color="#7a5e40" outline={false} position={[0.11, 0.02, -0.02]} rotation={[0.2, 0, -0.4]}>
        <boxGeometry args={[0.04, 0.12, 0.06]} />
      </Toon>
    </group>
  )
}

// Hedgehog curled up
function Hedgehog({ position }) {
  return (
    <group position={position}>
      {/* Body with spikes */}
      <Toon color="#8a7050" outlineColor="#5a4030"><sphereGeometry args={[0.1, 8, 8]} /></Toon>
      {/* Spikes */}
      {[0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6].map((a, i) => (
        <Toon key={i} color="#6a5038" outline={false}
          position={[Math.sin(a) * 0.08, 0.06 + (i % 2) * 0.03, Math.cos(a) * 0.08 - 0.02]}
          rotation={[Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5]}>
          <coneGeometry args={[0.015, 0.06, 4]} />
        </Toon>
      ))}
      {/* Face */}
      <Toon color="#d4b890" outline={false} position={[0, 0.02, 0.08]}>
        <sphereGeometry args={[0.06, 6, 6]} />
      </Toon>
      {/* Nose */}
      <Toon color="#222" outline={false} position={[0, 0.03, 0.14]}>
        <sphereGeometry args={[0.012, 4, 4]} />
      </Toon>
      {/* Eyes */}
      <Toon color="#111" outline={false} position={[-0.025, 0.06, 0.12]}><sphereGeometry args={[0.008, 4, 4]} /></Toon>
      <Toon color="#111" outline={false} position={[0.025, 0.06, 0.12]}><sphereGeometry args={[0.008, 4, 4]} /></Toon>
      {/* Blush */}
      <Toon color="#ffaaaa" outline={false} position={[-0.04, 0.02, 0.11]}><sphereGeometry args={[0.01, 4, 4]} /></Toon>
      <Toon color="#ffaaaa" outline={false} position={[0.04, 0.02, 0.11]}><sphereGeometry args={[0.01, 4, 4]} /></Toon>
    </group>
  )
}

// Raccoon sitting
function Raccoon({ position }) {
  return (
    <group position={position}>
      {/* Body */}
      <Toon color="#888888" outlineColor="#444"><sphereGeometry args={[0.13, 8, 8]} /></Toon>
      {/* Head */}
      <Toon color="#999" outline={false} position={[0, 0.15, 0.05]}>
        <sphereGeometry args={[0.1, 8, 8]} />
      </Toon>
      {/* Ears */}
      <Toon color="#666" outline={false} position={[-0.06, 0.26, 0.05]}>
        <sphereGeometry args={[0.025, 6, 6]} />
      </Toon>
      <Toon color="#666" outline={false} position={[0.06, 0.26, 0.05]}>
        <sphereGeometry args={[0.025, 6, 6]} />
      </Toon>
      {/* Mask */}
      <Toon color="#333" outline={false} position={[-0.04, 0.18, 0.1]}><sphereGeometry args={[0.025, 6, 6]} /></Toon>
      <Toon color="#333" outline={false} position={[0.04, 0.18, 0.1]}><sphereGeometry args={[0.025, 6, 6]} /></Toon>
      {/* Eyes */}
      <Toon color="#fff" outline={false} position={[-0.04, 0.18, 0.12]}><sphereGeometry args={[0.015, 6, 6]} /></Toon>
      <Toon color="#fff" outline={false} position={[0.04, 0.18, 0.12]}><sphereGeometry args={[0.015, 6, 6]} /></Toon>
      <Toon color="#111" outline={false} position={[-0.04, 0.18, 0.133]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
      <Toon color="#111" outline={false} position={[0.04, 0.18, 0.133]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
      {/* Nose */}
      <Toon color="#222" outline={false} position={[0, 0.14, 0.13]}><sphereGeometry args={[0.012, 4, 4]} /></Toon>
      {/* Snout */}
      <Toon color="#ccc" outline={false} position={[0, 0.13, 0.11]}><sphereGeometry args={[0.035, 6, 6]} /></Toon>
      {/* Striped tail */}
      <Toon color="#888" outline={false} position={[0, 0.06, -0.15]}><sphereGeometry args={[0.04, 6, 6]} /></Toon>
      <Toon color="#444" outline={false} position={[0, 0.08, -0.19]}><sphereGeometry args={[0.035, 6, 6]} /></Toon>
      <Toon color="#888" outline={false} position={[0, 0.1, -0.22]}><sphereGeometry args={[0.03, 6, 6]} /></Toon>
    </group>
  )
}

// Deer standing
function Deer({ position }) {
  return (
    <group position={position}>
      {/* Body */}
      <Toon color="#c49060" outlineColor="#7a5838" position={[0, 0.12, 0]} scale={[0.7, 0.8, 1.1]}>
        <sphereGeometry args={[0.15, 8, 8]} />
      </Toon>
      {/* Head */}
      <Toon color="#d4a070" outline={false} position={[0, 0.28, 0.12]}>
        <sphereGeometry args={[0.08, 8, 8]} />
      </Toon>
      {/* Ears */}
      <Toon color="#c49060" outline={false} position={[-0.06, 0.36, 0.1]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.025, 0.05, 0.015]} />
      </Toon>
      <Toon color="#c49060" outline={false} position={[0.06, 0.36, 0.1]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.025, 0.05, 0.015]} />
      </Toon>
      {/* Tiny antlers */}
      <Toon color="#8a7050" outline={false} position={[-0.03, 0.38, 0.08]}>
        <cylinderGeometry args={[0.005, 0.005, 0.06, 4]} />
      </Toon>
      <Toon color="#8a7050" outline={false} position={[0.03, 0.38, 0.08]}>
        <cylinderGeometry args={[0.005, 0.005, 0.06, 4]} />
      </Toon>
      {/* Eyes */}
      <Toon color="#fff" outline={false} position={[-0.03, 0.3, 0.17]}><sphereGeometry args={[0.016, 6, 6]} /></Toon>
      <Toon color="#fff" outline={false} position={[0.03, 0.3, 0.17]}><sphereGeometry args={[0.016, 6, 6]} /></Toon>
      <Toon color="#222" outline={false} position={[-0.03, 0.3, 0.184]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
      <Toon color="#222" outline={false} position={[0.03, 0.3, 0.184]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
      {/* Nose */}
      <Toon color="#333" outline={false} position={[0, 0.27, 0.19]}><sphereGeometry args={[0.01, 4, 4]} /></Toon>
      {/* Legs */}
      {[[-0.05, 0, 0.06], [0.05, 0, 0.06], [-0.05, 0, -0.06], [0.05, 0, -0.06]].map((p, i) => (
        <Toon key={i} color="#b08050" outline={false} position={p}>
          <cylinderGeometry args={[0.015, 0.015, 0.14, 4]} />
        </Toon>
      ))}
      {/* Tail */}
      <Toon color="#fff8e8" outline={false} position={[0, 0.14, -0.16]}><sphereGeometry args={[0.025, 6, 6]} /></Toon>
      {/* Blush */}
      <Toon color="#ffaaaa" outline={false} position={[-0.06, 0.27, 0.16]}><sphereGeometry args={[0.01, 4, 4]} /></Toon>
      <Toon color="#ffaaaa" outline={false} position={[0.06, 0.27, 0.16]}><sphereGeometry args={[0.01, 4, 4]} /></Toon>
    </group>
  )
}

// Squirrel
function Squirrel({ position }) {
  const tailRef = useRef()
  useFrame(({ clock }) => {
    if (tailRef.current) tailRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.5) * 0.15 - 0.3
  })
  return (
    <group position={position}>
      {/* Body */}
      <Toon color="#c07840" outlineColor="#804820"><sphereGeometry args={[0.09, 8, 8]} /></Toon>
      {/* Head */}
      <Toon color="#c88848" outline={false} position={[0, 0.1, 0.06]}>
        <sphereGeometry args={[0.07, 8, 8]} />
      </Toon>
      {/* Ears */}
      <Toon color="#c88848" outline={false} position={[-0.04, 0.19, 0.06]}>
        <sphereGeometry args={[0.018, 6, 6]} />
      </Toon>
      <Toon color="#c88848" outline={false} position={[0.04, 0.19, 0.06]}>
        <sphereGeometry args={[0.018, 6, 6]} />
      </Toon>
      {/* Eyes */}
      <Toon color="#fff" outline={false} position={[-0.025, 0.13, 0.11]}><sphereGeometry args={[0.015, 6, 6]} /></Toon>
      <Toon color="#fff" outline={false} position={[0.025, 0.13, 0.11]}><sphereGeometry args={[0.015, 6, 6]} /></Toon>
      <Toon color="#222" outline={false} position={[-0.025, 0.13, 0.123]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
      <Toon color="#222" outline={false} position={[0.025, 0.13, 0.123]}><sphereGeometry args={[0.009, 6, 6]} /></Toon>
      {/* Nose */}
      <Toon color="#222" outline={false} position={[0, 0.1, 0.13]}><sphereGeometry args={[0.008, 4, 4]} /></Toon>
      {/* Belly */}
      <Toon color="#e8c890" outline={false} position={[0, -0.01, 0.05]}>
        <sphereGeometry args={[0.055, 6, 6]} />
      </Toon>
      {/* Big fluffy tail */}
      <group ref={tailRef} position={[0, 0.08, -0.1]}>
        <Toon color="#c07840" outline={false}><sphereGeometry args={[0.05, 6, 6]} /></Toon>
        <Toon color="#c07840" outline={false} position={[0, 0.06, -0.03]}><sphereGeometry args={[0.04, 6, 6]} /></Toon>
        <Toon color="#c07840" outline={false} position={[0, 0.1, -0.01]}><sphereGeometry args={[0.035, 6, 6]} /></Toon>
      </group>
    </group>
  )
}

// Array of animal components — one per island
const animalComponents = [Fox, Penguin, Owl, Hedgehog, Raccoon, Deer, Squirrel]

export default function IslandAnimal({ index = 0, position = [0, 0, 0] }) {
  const Animal = animalComponents[index % animalComponents.length]
  return <Animal position={position} />
}
