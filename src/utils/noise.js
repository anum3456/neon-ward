// Small, dependency-free 2D value-noise generator.
// Deterministic per-seed so terrain is stable across reloads.

function hash(x, y, seed) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123
  return s - Math.floor(s)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function smooth(t) {
  return t * t * (3 - 2 * t)
}

export function noise2D(x, y, seed = 1) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = x0 + 1
  const y1 = y0 + 1

  const sx = smooth(x - x0)
  const sy = smooth(y - y0)

  const n00 = hash(x0, y0, seed)
  const n10 = hash(x1, y0, seed)
  const n01 = hash(x0, y1, seed)
  const n11 = hash(x1, y1, seed)

  const ix0 = lerp(n00, n10, sx)
  const ix1 = lerp(n01, n11, sx)

  return lerp(ix0, ix1, sy) * 2 - 1
}

// Fractal sum of a few octaves for more organic rock/terrain shapes.
export function fbm(x, y, seed = 1, octaves = 4) {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  for (let i = 0; i < octaves; i++) {
    value += noise2D(x * frequency, y * frequency, seed + i) * amplitude
    amplitude *= 0.5
    frequency *= 2
  }
  return value
}
