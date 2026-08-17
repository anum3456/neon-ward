# Neon Ward — A City Block, After Midnight

A dense miniature cyberpunk city block built for the 3D Websites Hackathon: procedurally generated glowing towers, flickering neon signage, flying traffic on light-trail paths, falling rain over a reflective circuit-grid street, and a hidden koi-pond puzzle that wakes the whole block up.

No external 3D models, textures, or audio files — everything is built from primitive/instanced geometry and the Web Audio API.

## Features

- **Procedurally generated skyline** — tower placement, height, and neon color are seeded/randomized on load
- **Koi pond puzzle** — match the color sequence to trigger a wake-wave that lights up the entire skyline
- **Fly mode** — WASD + mouse-look free camera, plus on-screen touch controls for mobile
- **Neon signage**, **flying traffic**, and **rain** over a reflective street
- Click the open sky to launch a delivery drone
- Procedural ambient audio — no audio files

## Stack

React + Vite, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `gsap`

## Run it locally

```
npm install
npm run dev
```
