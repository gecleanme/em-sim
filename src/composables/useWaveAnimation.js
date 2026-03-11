import { shallowRef, ref } from 'vue'
import * as THREE from 'three'

export function useWaveAnimation(scene, onTick) {
  const waveGroup = shallowRef(null)
  const isAnimating = ref(false)
  const frequency = ref(1.0)
  const wavelength = ref(2.0)
  const amplitude = ref(0.5)
  const propagationSpeed = ref(1.0)
  const clock = new THREE.Clock()

  function createTransverseWave(opts = {}) {
    const {
      segments = 200,
      length = 10,
      showEField = true,
      showHField = true,
      eColor = 0xe87461,
      hColor = 0x5ba8c8,
      origin = new THREE.Vector3(0, 0, 0),
    } = opts

    clearWave()
    waveGroup.value = new THREE.Group()

    if (showEField) {
      const line = makeLine(segments, length, eColor)
      line.userData = { axis: 'y', segments, length }
      waveGroup.value.add(line)
    }
    if (showHField) {
      const line = makeLine(segments, length, hColor)
      line.userData = { axis: 'x', segments, length }
      waveGroup.value.add(line)
    }

    // Propagation axis
    const axGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, length)])
    waveGroup.value.add(
      new THREE.Line(axGeo, new THREE.LineBasicMaterial({ color: 0x5f7060, transparent: true, opacity: 0.25 }))
    )

    waveGroup.value.position.copy(origin)
    scene.value.add(waveGroup.value)
    isAnimating.value = true

    onTick(() => {
      if (!isAnimating.value || !waveGroup.value) return
      const t = clock.getElapsedTime()
      waveGroup.value.children.forEach((child) => {
        if (!child.isLine || !child.userData.axis) return
        const pos = child.geometry.attributes.position
        const k = (2 * Math.PI) / wavelength.value
        const omega = 2 * Math.PI * frequency.value
        for (let i = 0; i <= child.userData.segments; i++) {
          const z = (i / child.userData.segments) * child.userData.length
          const val = amplitude.value * Math.sin(k * z - omega * t * propagationSpeed.value)
          if (child.userData.axis === 'y') pos.setY(i, val)
          else pos.setX(i, val)
        }
        pos.needsUpdate = true
      })
    })
  }

  function makeLine(segments, length, color) {
    const pts = []
    for (let i = 0; i <= segments; i++) pts.push(new THREE.Vector3(0, 0, (i / segments) * length))
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.9 })
    )
  }

  function clearWave() {
    isAnimating.value = false
    if (!waveGroup.value) return
    waveGroup.value.traverse((c) => {
      c.geometry?.dispose()
      c.material?.dispose()
    })
    scene.value.remove(waveGroup.value)
    waveGroup.value = null
  }

  function pause() {
    isAnimating.value = false
  }
  function resume() {
    isAnimating.value = true
    clock.start()
  }

  return {
    waveGroup,
    isAnimating,
    frequency,
    wavelength,
    amplitude,
    propagationSpeed,
    createTransverseWave,
    clearWave,
    pause,
    resume,
  }
}
