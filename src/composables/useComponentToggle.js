import { reactive } from 'vue'

const DEFAULT_CONFIG = {
  antenna: ['Antenna', 'Radiator', 'Feed', 'Dipole', 'Patch', 'Element'],
  ground_plane: ['GroundPlane', 'Ground', 'Substrate'],
  waveguide: ['Waveguide', 'Guide', 'Cavity', 'Resonator'],
  connectors: ['Connector', 'Port', 'SMA', 'Coax'],
  housing: ['Housing', 'Enclosure', 'Radome', 'Shell'],
  pcb: ['PCB', 'Board', 'Trace', 'Circuit'],
}

export function useComponentToggle() {
  const config = { ...DEFAULT_CONFIG }
  const components = reactive(Object.fromEntries(Object.keys(config).map((k) => [k, true])))

  function applyVisibility(model) {
    if (!model) return
    for (const [cat, names] of Object.entries(config)) {
      const vis = components[cat]
      model.traverse((c) => {
        if (names.some((n) => c.name === n || c.name.includes(n))) c.visible = vis
      })
    }
  }

  function toggleComponent(cat) {
    components[cat] = !components[cat]
  }
  function showAll() {
    for (const k of Object.keys(components)) components[k] = true
  }
  function setMeshNames(cat, names) {
    config[cat] = names
    if (!(cat in components)) components[cat] = true
  }

  return { components, applyVisibility, toggleComponent, showAll, setMeshNames }
}
