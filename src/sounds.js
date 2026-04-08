// Synthetic sound effects using Web Audio API — no files needed

let audioCtx = null

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

// Water splash — filtered white noise burst
export function playSplash() {
  const ctx = getCtx()
  const duration = 0.4
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 6) * 0.3
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 800
  const gain = ctx.createGain()
  gain.gain.value = 0.15
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
}

// Wood creak — low frequency modulated sine
export function playCreak() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(80, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15)
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 200
  filter.Q.value = 2
  osc.connect(filter).connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.4)
}

// Ship bell — sine with harmonics and decay
export function playBell() {
  const ctx = getCtx()
  const freqs = [800, 1200, 1600]
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    gain.gain.setValueAtTime(0.08 / (i + 1), ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1.3)
  })
}

// Seagull — frequency sweep
export function playSeagull() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12)
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25)
  osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.35)
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5)
  gain.gain.setValueAtTime(0.04, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.15)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.6)
}

// Gentle wave ambient — low rumble
export function playWave() {
  const ctx = getCtx()
  const duration = 1.5
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize
    data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.15
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 300
  const gain = ctx.createGain()
  gain.gain.value = 0.08
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
}
