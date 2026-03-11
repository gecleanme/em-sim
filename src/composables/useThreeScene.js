import { onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function useThreeScene(containerRef, options = {}) {
  const scene = shallowRef(null)
  const camera = shallowRef(null)
  const renderer = shallowRef(null)
  const controls = shallowRef(null)

  let animationId = null
  const callbacks = []

  function onTick(cb) {
    callbacks.push(cb)
  }

  function init() {
    const el = containerRef.value
    const w = el.clientWidth
    const h = el.clientHeight

    scene.value = new THREE.Scene()
    scene.value.background = new THREE.Color(options.background ?? 0x222223)

    camera.value = new THREE.PerspectiveCamera(options.fov ?? 45, w / h, 0.1, 1000)
    camera.value.position.set(options.cameraX ?? 0, options.cameraY ?? 2, options.cameraZ ?? 6)

    renderer.value = new THREE.WebGLRenderer({
      antialias: true,
      alpha: options.alpha ?? false,
      preserveDrawingBuffer: true,
    })
    renderer.value.setSize(w, h)
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.value.outputColorSpace = THREE.SRGBColorSpace
    renderer.value.toneMapping = THREE.ACESFilmicToneMapping
    renderer.value.toneMappingExposure = 1.0
    el.appendChild(renderer.value.domElement)

    controls.value = new OrbitControls(camera.value, renderer.value.domElement)
    controls.value.enableDamping = true
    controls.value.dampingFactor = 0.08
    controls.value.target.set(0, 0, 0)

    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    const key = new THREE.DirectionalLight(0xffffff, 0.8)
    key.position.set(5, 10, 7)
    const fill = new THREE.DirectionalLight(0xffffff, 0.3)
    fill.position.set(-5, 5, -5)
    scene.value.add(ambient, key, fill)

    window.addEventListener('resize', onResize)
    animate()
  }

  function animate() {
    animationId = requestAnimationFrame(animate)
    controls.value?.update()
    for (const cb of callbacks) cb()
    renderer.value.render(scene.value, camera.value)
  }

  function onResize() {
    const el = containerRef.value
    if (!el) return
    camera.value.aspect = el.clientWidth / el.clientHeight
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(el.clientWidth, el.clientHeight)
  }

  function dispose() {
    window.removeEventListener('resize', onResize)
    if (animationId) cancelAnimationFrame(animationId)
    controls.value?.dispose()
    renderer.value?.dispose()
    renderer.value?.domElement?.remove()
  }

  onMounted(init)
  onBeforeUnmount(dispose)

  return { scene, camera, renderer, controls, onTick }
}
