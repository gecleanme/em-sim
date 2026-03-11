import { shallowRef } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

export function useModelLoader() {
  const model = shallowRef(null)
  const progress = shallowRef(0)
  const error = shallowRef(null)
  const isLoading = shallowRef(false)

  function load(url, opts = {}) {
    return new Promise((resolve, reject) => {
      isLoading.value = true
      error.value = null
      progress.value = 0

      const ext = url.split('.').pop().toLowerCase()
      const onProg = (e) => {
        if (e.total) progress.value = (e.loaded / e.total) * 100
      }
      const onErr = (err) => {
        error.value = err
        isLoading.value = false
        reject(err)
      }
      const done = (result) => {
        isLoading.value = false
        resolve(result)
      }

      switch (ext) {
        case 'glb':
        case 'gltf':
          gltfLoader.load(
            url,
            (gltf) => {
              model.value = gltf.scene
              done(gltf)
            },
            onProg,
            onErr
          )
          break
        case 'fbx':
          new FBXLoader().load(
            url,
            (fbx) => {
              model.value = fbx
              done(fbx)
            },
            onProg,
            onErr
          )
          break
        case 'obj':
          new OBJLoader().load(
            url,
            (obj) => {
              model.value = obj
              done(obj)
            },
            onProg,
            onErr
          )
          break
        case 'stl':
          new STLLoader().load(
            url,
            (geo) => {
              const mat = new THREE.MeshStandardMaterial({
                color: opts.color ?? 0x4488ff,
                metalness: 0.3,
                roughness: 0.6,
              })
              const mesh = new THREE.Mesh(geo, mat)
              model.value = mesh
              done(mesh)
            },
            onProg,
            onErr
          )
          break
        default:
          onErr(new Error(`Unsupported: .${ext}`))
      }
    })
  }

  return { model, progress, error, isLoading, load }
}
