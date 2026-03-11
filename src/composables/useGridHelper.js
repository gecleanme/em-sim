import { ref, shallowRef } from 'vue'
import * as THREE from 'three'

export function useGridHelper(scene) {
  const gridGroup = shallowRef(null)
  const visible = ref(true)

  function create(opts = {}) {
    const { size = 10, divisions = 20, axisLength = 5 } = opts
    remove()

    gridGroup.value = new THREE.Group()

    const grid = new THREE.GridHelper(size, divisions, 0x354455, 0x263040)
    grid.material.transparent = true
    grid.material.opacity = 0.35
    gridGroup.value.add(grid)

    // XYZ axis arrows
    gridGroup.value.add(
      new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), axisLength, 0xe87461, 0.18, 0.09)
    )
    gridGroup.value.add(
      new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), axisLength, 0x8ab87a, 0.18, 0.09)
    )
    gridGroup.value.add(
      new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), axisLength, 0x5ba8c8, 0.18, 0.09)
    )

    scene.value.add(gridGroup.value)
  }

  function toggle() {
    visible.value = !visible.value
    if (gridGroup.value) gridGroup.value.visible = visible.value
  }

  function remove() {
    if (!gridGroup.value) return
    gridGroup.value.traverse((c) => {
      c.geometry?.dispose()
      c.material?.dispose()
    })
    scene.value.remove(gridGroup.value)
    gridGroup.value = null
  }

  return { visible, create, toggle, remove }
}
