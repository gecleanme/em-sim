import * as THREE from 'three'

const STOPS = [
  { t: 0.0, c: new THREE.Color(0x004f59) },
  { t: 0.2, c: new THREE.Color(0x5ba8c8) },
  { t: 0.4, c: new THREE.Color(0x8ab87a) },
  { t: 0.6, c: new THREE.Color(0xd0debb) },
  { t: 0.8, c: new THREE.Color(0xf6b700) },
  { t: 1.0, c: new THREE.Color(0xe87461) },
]

function heatColor(v) {
  v = Math.max(0, Math.min(1, v))
  let lo = STOPS[0],
    hi = STOPS[STOPS.length - 1]
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (v >= STOPS[i].t && v <= STOPS[i + 1].t) {
      lo = STOPS[i]
      hi = STOPS[i + 1]
      break
    }
  }
  const r = hi.t - lo.t
  return lo.c.clone().lerp(hi.c, r === 0 ? 0 : (v - lo.t) / r)
}

export function useHeatmap() {
  const saved = new Map()

  function applyHeatmap(mesh, intensityFn) {
    if (!mesh.isMesh) return
    if (!saved.has(mesh.uuid)) saved.set(mesh.uuid, mesh.material.clone())

    const pos = mesh.geometry.attributes.position
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const c = heatColor(intensityFn(pos.getX(i), pos.getY(i), pos.getZ(i)))
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    mesh.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.6,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    })
  }

  function clearHeatmap(mesh) {
    if (!saved.has(mesh.uuid)) return
    mesh.material.dispose()
    mesh.material = saved.get(mesh.uuid)
    saved.delete(mesh.uuid)
    mesh.geometry.deleteAttribute('color')
  }

  return { applyHeatmap, clearHeatmap }
}
