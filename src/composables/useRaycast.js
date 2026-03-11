import { shallowRef, ref, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

export function useRaycast(camera, renderer) {
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const hoveredObject = shallowRef(null)
  const clickedObject = shallowRef(null)

  // Screen-space cursor position for tooltip placement
  const cursorX = ref(0)
  const cursorY = ref(0)

  const savedEmissive = new Map()
  let clickHandler = null
  let moveHandler = null

  function enable(targets, callbacks = {}) {
    const canvas = renderer.value.domElement

    clickHandler = (e) => {
      updatePointer(e, canvas)
      raycaster.setFromCamera(pointer, camera.value)
      const hits = raycaster.intersectObjects(targets, true)
      if (hits.length > 0) {
        clickedObject.value = hits[0].object
        callbacks.onClick?.(hits[0])
      }
    }

    moveHandler = (e) => {
      cursorX.value = e.clientX
      cursorY.value = e.clientY
      updatePointer(e, canvas)
      raycaster.setFromCamera(pointer, camera.value)
      const hits = raycaster.intersectObjects(targets, true)

      if (hoveredObject.value && hoveredObject.value !== hits[0]?.object) {
        resetEmissive(hoveredObject.value)
        callbacks.onHoverOut?.(hoveredObject.value)
        hoveredObject.value = null
        canvas.style.cursor = 'default'
      }

      if (hits.length > 0 && hits[0].object.isMesh) {
        hoveredObject.value = hits[0].object
        setEmissive(hoveredObject.value)
        canvas.style.cursor = 'pointer'
        callbacks.onHover?.(hits[0])
      }
    }

    canvas.addEventListener('click', clickHandler)
    canvas.addEventListener('mousemove', moveHandler)
  }

  function disable() {
    const canvas = renderer.value?.domElement
    if (!canvas) return
    canvas.removeEventListener('click', clickHandler)
    canvas.removeEventListener('mousemove', moveHandler)
    canvas.style.cursor = 'default'
    if (hoveredObject.value) resetEmissive(hoveredObject.value)
  }

  function updatePointer(e, canvas) {
    const r = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1
  }

  function setEmissive(mesh) {
    if (!mesh.material?.emissive) return
    if (!savedEmissive.has(mesh.uuid)) savedEmissive.set(mesh.uuid, mesh.material.emissive.clone())
    mesh.material.emissive.set(0x1a2a1a)
  }

  function resetEmissive(mesh) {
    if (!mesh.material?.emissive || !savedEmissive.has(mesh.uuid)) return
    mesh.material.emissive.copy(savedEmissive.get(mesh.uuid))
    savedEmissive.delete(mesh.uuid)
  }

  onBeforeUnmount(disable)

  return { hoveredObject, clickedObject, cursorX, cursorY, enable, disable }
}
