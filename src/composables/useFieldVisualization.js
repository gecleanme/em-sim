import { shallowRef } from 'vue'
import * as THREE from 'three'

const COLOR_STOPS = [
  { t: 0.0, color: new THREE.Color(0x004f59) },
  { t: 0.25, color: new THREE.Color(0x5ba8c8) },
  { t: 0.5, color: new THREE.Color(0x8ab87a) },
  { t: 0.75, color: new THREE.Color(0xf6b700) },
  { t: 1.0, color: new THREE.Color(0xe87461) },
]

function getFieldColor(v) {
  v = Math.max(0, Math.min(1, v))
  let lo = COLOR_STOPS[0],
    hi = COLOR_STOPS[COLOR_STOPS.length - 1]
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (v >= COLOR_STOPS[i].t && v <= COLOR_STOPS[i + 1].t) {
      lo = COLOR_STOPS[i]
      hi = COLOR_STOPS[i + 1]
      break
    }
  }
  const range = hi.t - lo.t
  return lo.color.clone().lerp(hi.color, range === 0 ? 0 : (v - lo.t) / range)
}

export function useFieldVisualization(scene) {
  const fieldGroup = shallowRef(null)

  function renderVectorField(data, opts = {}) {
    const { scale = 1, opacity = 0.8, maxArrows = 5000 } = opts
    clearField()

    fieldGroup.value = new THREE.Group()
    const maxMag = Math.max(...data.map((d) => d.magnitude), 0.001)
    const step = Math.max(1, Math.floor(data.length / maxArrows))

    for (let i = 0; i < data.length; i += step) {
      const pt = data[i]
      const norm = pt.magnitude / maxMag
      if (norm < 0.01) continue

      const dir = new THREE.Vector3(pt.direction.x, pt.direction.y, pt.direction.z).normalize()
      const arrow = new THREE.ArrowHelper(
        dir,
        new THREE.Vector3(pt.position.x, pt.position.y, pt.position.z),
        norm * scale,
        getFieldColor(norm),
        0.1 * scale,
        0.06 * scale
      )
      arrow.line.material.transparent = true
      arrow.line.material.opacity = opacity
      arrow.cone.material.transparent = true
      arrow.cone.material.opacity = opacity
      arrow.userData = { normalizedMag: norm }
      fieldGroup.value.add(arrow)
    }

    scene.value.add(fieldGroup.value)
  }

  function renderIntensityCloud(data, opts = {}) {
    const { pointSize = 0.05, opacity = 0.7 } = opts
    clearField()

    fieldGroup.value = new THREE.Group()
    const maxMag = Math.max(...data.map((d) => d.magnitude), 0.001)
    const positions = new Float32Array(data.length * 3)
    const colors = new Float32Array(data.length * 3)

    for (let i = 0; i < data.length; i++) {
      positions[i * 3] = data[i].position.x
      positions[i * 3 + 1] = data[i].position.y
      positions[i * 3 + 2] = data[i].position.z
      const c = getFieldColor(data[i].magnitude / maxMag)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true,
      transparent: true,
      opacity,
      sizeAttenuation: true,
    })
    fieldGroup.value.add(new THREE.Points(geo, mat))
    scene.value.add(fieldGroup.value)
  }

  function clearField() {
    if (!fieldGroup.value) return
    fieldGroup.value.traverse((c) => {
      c.geometry?.dispose()
      c.material?.dispose()
    })
    scene.value.remove(fieldGroup.value)
    fieldGroup.value = null
  }

  function setIntensityThreshold(threshold) {
    fieldGroup.value?.traverse((c) => {
      if (c.userData?.normalizedMag !== undefined) c.visible = c.userData.normalizedMag >= threshold
    })
  }

  return { fieldGroup, getFieldColor, renderVectorField, renderIntensityCloud, clearField, setIntensityThreshold }
}
