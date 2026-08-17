// Fully procedural ambience: a soft low drone + filtered noise "wind",
// plus a short synthesized chime for interactions. No audio files required.

let ctx = null
let master = null
let droneGain = null
let windGain = null
let started = false

function ensureContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
  }
  return ctx
}

function buildNoiseBuffer(context) {
  const bufferSize = context.sampleRate * 2
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

export function startAmbience() {
  const context = ensureContext()
  if (context.state === 'suspended') context.resume()
  if (started) return
  started = true

  // low drone
  const osc1 = context.createOscillator()
  const osc2 = context.createOscillator()
  osc1.type = 'sine'
  osc2.type = 'sine'
  osc1.frequency.value = 64
  osc2.frequency.value = 96
  droneGain = context.createGain()
  droneGain.gain.value = 0.05
  osc1.connect(droneGain)
  osc2.connect(droneGain)
  droneGain.connect(master)
  osc1.start()
  osc2.start()

  // filtered noise wind
  const noise = context.createBufferSource()
  noise.buffer = buildNoiseBuffer(context)
  noise.loop = true
  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 500
  filter.Q.value = 0.6
  windGain = context.createGain()
  windGain.gain.value = 0.02
  noise.connect(filter)
  filter.connect(windGain)
  windGain.connect(master)
  noise.start()

  // slow wind swell
  const lfo = context.createOscillator()
  const lfoGain = context.createGain()
  lfo.frequency.value = 0.07
  lfoGain.gain.value = 0.012
  lfo.connect(lfoGain)
  lfoGain.connect(windGain.gain)
  lfo.start()

  master.gain.setValueAtTime(master.gain.value, context.currentTime)
  master.gain.linearRampToValueAtTime(1, context.currentTime + 2)
}

export function setAmbienceMuted(muted) {
  if (!ctx || !master) return
  const target = muted ? 0 : 1
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.6)
}

export function playChord(freqs = [523, 659, 784]) {
  const context = ensureContext()
  if (context.state === 'suspended') context.resume()
  const now = context.currentTime
  freqs.forEach((freq, i) => {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0
    osc.connect(gain)
    gain.connect(master || context.destination)
    const start = now + i * 0.12
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.1, start + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 3)
    osc.start(start)
    osc.stop(start + 3.1)
  })
}

export function playBuzz() {
  const context = ensureContext()
  if (context.state === 'suspended') context.resume()
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = 'sawtooth'
  osc.frequency.value = 110
  gain.gain.value = 0
  osc.connect(gain)
  gain.connect(master || context.destination)
  const now = context.currentTime
  gain.gain.linearRampToValueAtTime(0.08, now + 0.01)
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.25)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
  osc.start(now)
  osc.stop(now + 0.32)
}

export function playChime(freq = 660) {
  const context = ensureContext()
  if (context.state === 'suspended') context.resume()
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.value = 0
  osc.connect(gain)
  gain.connect(master || context.destination)
  const now = context.currentTime
  gain.gain.linearRampToValueAtTime(0.12, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
  osc.start(now)
  osc.stop(now + 1.5)
}
