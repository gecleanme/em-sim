import * as THREE from 'three'

export function useModelUtils() {
  function centerModel(model) {
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(center)
    return box.getSize(new THREE.Vector3())
  }

  function frameCameraOnModel(model, camera, controls) {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    const dist = (maxDim / (2 * Math.tan(fov / 2))) * 1.8

    camera.position.set(center.x + dist * 0.5, center.y + dist * 0.4, center.z + dist)
    controls.target.copy(center)
    controls.update()
  }

  function disposeModel(model) {
    if (!model) return
    model.traverse((child) => {
      if (!child.isMesh) return
      child.geometry.dispose()
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const mat of mats) {
        for (const key of Object.keys(mat)) {
          if (mat[key]?.isTexture) mat[key].dispose()
        }
        mat.dispose()
      }
    })
    model.parent?.remove(model)
  }

  return { centerModel, frameCameraOnModel, disposeModel }
}
