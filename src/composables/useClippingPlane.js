import { ref, shallowRef, watch } from 'vue'
import * as THREE from 'three'

const NORMALS = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
}

export function useClippingPlane(renderer) {
  const plane = shallowRef(null)
  const helper = shallowRef(null)
  const enabled = ref(false)
  const axis = ref('x')
  const position = ref(0)
  const flipped = ref(false)

  function init() {
    renderer.value.localClippingEnabled = true
    plane.value = new THREE.Plane(NORMALS[axis.value], -position.value)
  }

  function applyToModel(model, sceneObj) {
    if (!plane.value) init()
    model.traverse((c) => {
      if (!c.isMesh) return
      c.material = c.material.clone()
      c.material.clippingPlanes = [plane.value]
      c.material.clipShadows = true
      c.material.side = THREE.DoubleSide
    })
    if (helper.value) sceneObj.remove(helper.value)
    helper.value = new THREE.PlaneHelper(plane.value, 5, 0xd0debb)
    helper.value.material.transparent = true
    helper.value.material.opacity = 0.12
    helper.value.visible = enabled.value
    sceneObj.add(helper.value)
  }

  function update() {
    if (!plane.value) return
    const n = NORMALS[axis.value].clone()
    if (flipped.value) n.negate()
    plane.value.normal.copy(n)
    plane.value.constant = flipped.value ? position.value : -position.value
    if (helper.value) helper.value.visible = enabled.value
  }

  watch([axis, position, flipped, enabled], update)

  function removeFromModel(model) {
    model.traverse((c) => {
      if (c.isMesh) c.material.clippingPlanes = []
    })
    if (helper.value) {
      helper.value.parent?.remove(helper.value)
      helper.value = null
    }
  }

  return { enabled, axis, position, flipped, init, applyToModel, removeFromModel }
}
