# EM Field Simulator

Interactive 3D electromagnetic wave simulation viewer. Vue 3 + Three.js + Tailwind v4.

## Disclaimer 
This is mainly to experiment with Three.js and show how it could be useful to our project. Field & EM wave data are hardcoded

## Setup

```bash
npm install
npm run dev
```

Note: If the model appears too large or too small/doesn't show up at all, adjust the `setScalar()` value in `SimulationViewer.vue` `onMounted`.
Adding User input soon

## Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Framework  | Vue 3 Composition API (`<script setup>`)  |
| 3D Engine  | Three.js                                  |
| Code Style | Prettier                                  |
| Styling    | Tailwind                                  |
| Icons      | Material                                  |
| Theme      | company palette (see `main.css` `@theme`) |

## Structure

```
src/
├── composables/        All three.js logic, one concern per file
├── components/
│   ├── SimulationViewer.vue   Orchestrator wires composables to UI
│   ├── panels/                Control panels (field, wave, clipping, components)
│   └── ui/                    Reusable atoms (Icon, Slider, PanelSection, Legend)
├── assets/main.css     Theme + global styles
```

## Composables table (Lots of WIP)

| Composable              | Handles                                 | Panel                |
|-------------------------|-----------------------------------------|----------------------|
| `useThreeScene`         | Viewport, camera, controls, render loop | —                    |
| `useModelLoader`        | File loading + progress                 | Loading overlay      |
| `useModelUtils`         | Center, frame, dispose                  | —                    |
| `useRaycast`            | Click/hover + cursor position           | Tooltip              |
| `useGridHelper`         | Reference grid + axes                   | Toolbar: Grid        |
| `useFieldVisualization` | Field arrows / point cloud              | FieldControlPanel    |
| `useWaveAnimation`      | Animated E/H wave lines                 | WaveControlPanel     |
| `useHeatmap`            | Surface vertex coloring                 | Toolbar: Heatmap     |
| `useClippingPlane`      | Cross-section slice                     | ClippingControlPanel |
| `useComponentToggle`    | Show/hide model parts                   | ComponentPanel       |
| `useTransparency`       | Ghost mode for housing                  | Toolbar: Ghost       |
| `useScreenshot`         | PNG capture                             | Toolbar: Capture     |

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build
```
