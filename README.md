# Neon Ward — A City Block, After Midnight

A dense miniature cyberpunk city block, built for the 3D Websites
Hackathon: procedurally generated glowing towers, flickering neon
signage, flying traffic on light-trail paths, falling rain over a
reflective circuit-grid street, and a click-sky-to-launch delivery
drone ritual.

No external 3D models, textures, or audio files — everything is built
from primitive/instanced geometry and the Web Audio API, so there are
zero broken-asset risks and it loads in well under a second.

**Features**
- Splash screen → camera fly-in on entry
- **Procedurally generated skyline** — tower placement, height, width,
  and neon trim color are all seeded/randomized on load (regenerate
  the layout by reloading), with instanced lit windows that flicker
  independently per building
- **Fly mode** — a real WASD + mouse-look free camera, like navigating
  a 3D modeling viewport (Space/Shift for up/down, E to sprint, Esc to
  exit)
- **Neon signage** — glowing bar and ring signs in six saturated
  colors, each flickering on its own rhythm
- **Flying traffic** — four vehicles gliding on independent circular
  paths at different heights/speeds, each trailing an instanced light
  streak
- **Rain** — 260 instanced falling streaks over a reflective,
  circuit-grid street plane
- Click anywhere on the open sky to launch a glowing delivery drone
  (with a synthesized chime)
- Camera waypoint buttons (Street / Skyline / Overhead) that fly the
  camera with GSAP
- Chromatic aberration + heavy bloom + vignette post-processing for a
  moody, high-contrast night-city look
- Sound toggle — procedural ambient drone + wind, no audio files

## Stack

React + Vite, `@react-three/fiber` (Three.js for React),
`@react-three/drei` (helpers), `@react-three/postprocessing`
(bloom/vignette/chromatic aberration), `gsap` (camera moves).

## Run it locally

```
npm install
npm run dev
```

Open the printed localhost URL — edits hot-reload instantly.

## Build for production

```
npm run build
```

Outputs to `dist/`.

## Deploy (free, ~2 minutes) — for the "publicly accessible link" requirement

Push this folder to a GitHub repo, then import it into **Vercel**
(vercel.com) or **Netlify** — both auto-detect Vite and deploy on
push. That gives you the public URL your submission needs.

## Project structure

```
floating-world/
├── index.html                  entry HTML, fonts
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                React root
│   ├── App.jsx                 Canvas setup + camera fly-in intro
│   ├── styles.css              design tokens, overlay UI, loader
│   ├── components/
│   │   ├── Scene.jsx           composes everything, lighting, fog, post-fx
│   │   ├── Buildings.jsx       procedural tower layout + instanced lit windows
│   │   ├── NeonSigns.jsx       flickering bar/ring neon signage
│   │   ├── Vehicles.jsx        flying traffic on light-trail paths
│   │   ├── Rain.jsx            instanced rain + reflective circuit-grid street
│   │   ├── Drones.jsx          click-sky-to-launch delivery drone
│   │   ├── FlyControls.jsx     WASD + mouse-look free-fly camera
│   │   ├── ControlsUI.jsx      sound + fly-mode + waypoint buttons
│   │   ├── Splash.jsx          entry screen (also unlocks audio)
│   │   ├── Loader.jsx          loading progress screen
│   │   └── IntroOverlay.jsx    title + hint text UI
│   └── utils/
│       ├── noise.js            dependency-free 2D value/fbm noise
│       └── audio.js            procedural Web Audio ambience + chimes
└── README.md
```

## Customizing

- **Change the skyline density/height** — the `rand() > 0.72` skip
  chance and `height` formula in `Buildings.jsx`.
- **Change the palette** — the `NEON` color arrays at the top of
  `Buildings.jsx`, `NeonSigns.jsx`, and `Vehicles.jsx`, plus the CSS
  variables at the top of `styles.css`.
- **Add more signage/traffic** — copy an entry in the `SIGNS` array
  (`NeonSigns.jsx`) or `PATHS` array (`Vehicles.jsx`).
- **Tune the glow** — `Bloom`/`ChromaticAberration` params in
  `Scene.jsx`.

## For your hackathon submission

Remember the submission needs: live link, project description +
inspiration, 3+ screenshots, tech/tools list, and the source code
(this repo). A short demo video is optional but strengthens the "wow"
factor for judging.
