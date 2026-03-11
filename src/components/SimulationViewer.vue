<template>
  <div class="relative h-screen w-screen overflow-hidden bg-bolt-black">
    <!-- 3D Viewport -->
    <div ref="container" class="absolute inset-0"></div>

    <!-- Loading -->
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-bolt-black/95 backdrop-blur-sm"
      >
        <div class="mb-3 font-mono text-[10px] tracking-[0.2em] text-text-muted">LOADING MODEL</div>
        <div class="h-0.5 w-56 overflow-hidden rounded-full bg-border">
          <div
            class="h-full rounded-full bg-accent transition-all duration-200"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div class="mt-2 font-mono text-[10px] tabular-nums text-accent">{{ Math.round(progress) }}%</div>
      </div>
    </Transition>

    <!-- Header -->
    <div class="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-3">
      <div>
        <h1 class="font-mono text-xs font-semibold tracking-[0.15em] text-bolt-ivory">EM FIELD SIMULATOR</h1>
      </div>
    </div>

    <!-- Cursor-follow tooltip for hovered part name -->
    <div
      v-if="hoveredPartName"
      class="pointer-events-none fixed z-30 rounded border border-accent/20 bg-surface/90 px-2.5 py-1 font-mono text-[10px] text-accent backdrop-blur-sm"
      :style="{ left: raycast.cursorX.value + 14 + 'px', top: raycast.cursorY.value - 10 + 'px' }"
    >
      {{ hoveredPartName }}
    </div>

    <!-- Left Panel -->
    <div
      class="absolute bottom-20 left-3 top-14 z-10 flex w-52 flex-col gap-3 overflow-y-auto rounded-xl border border-border/40 bg-surface/80 p-2.5 backdrop-blur-md"
    >
      <FieldControlPanel
        :show-e-field="showEField"
        :show-h-field="showHField"
        :visualization-mode="vizMode"
        @toggle-e-field="toggleEField"
        @toggle-h-field="toggleHField"
        @set-mode="setVizMode"
        @set-threshold="fieldViz.setIntensityThreshold"
      />
      <WaveControlPanel
        :frequency="wave.frequency.value"
        :wavelength="wave.wavelength.value"
        :amplitude="wave.amplitude.value"
        :speed="wave.propagationSpeed.value"
        :is-animating="wave.isAnimating.value"
        @update:frequency="wave.frequency.value = $event"
        @update:wavelength="wave.wavelength.value = $event"
        @update:amplitude="wave.amplitude.value = $event"
        @update:speed="wave.propagationSpeed.value = $event"
        @toggle-animation="wave.isAnimating.value ? wave.pause() : wave.resume()"
      />
    </div>

    <!-- Right Panel -->
    <div
      class="absolute bottom-20 right-3 top-14 z-10 flex w-52 flex-col gap-3 overflow-y-auto rounded-xl border border-border/40 bg-surface/80 p-2.5 backdrop-blur-md"
    >
      <ClippingControlPanel
        :enabled="clipping.enabled.value"
        :axis="clipping.axis.value"
        :position="clipping.position.value"
        :flipped="clipping.flipped.value"
        @update:enabled="clipping.enabled.value = $event"
        @update:axis="clipping.axis.value = $event"
        @update:position="clipping.position.value = $event"
        @update:flipped="clipping.flipped.value = $event"
      />
    </div>

    <!-- Bottom Toolbar -->
    <div
      class="hidden absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-border/40 bg-surface/80 p-1 backdrop-blur-md"
    >
      <ToolbarBtn icon="grid_on" label="Grid" :active="grid.visible.value" @click="grid.toggle()" />
      <ToolbarBtn icon="blur_on" label="Ghost" :active="ghostActive" @click="toggleGhost" />
      <ToolbarBtn icon="thermostat" label="Heatmap" :active="heatmapActive" @click="toggleHeatmap" />
      <div class="mx-0.5 h-5 w-px bg-border/50"></div>
      <ToolbarBtn icon="photo_camera" label="Capture" :active="false" @click="screenshot.download('em-sim.png')" />
    </div>

    <!-- Color Legend -->
    <Transition name="fade">
      <ColorLegend v-if="heatmapActive || vizMode !== 'none'" min-label="0 V/m" max-label="Max" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, h } from 'vue'
import * as THREE from 'three'

import { useThreeScene } from '../composables/useThreeScene.js'
import { useModelLoader } from '../composables/useModelLoader.js'
import { useModelUtils } from '../composables/useModelUtils.js'
import { useRaycast } from '../composables/useRaycast.js'
import { useGridHelper } from '../composables/useGridHelper.js'
import { useFieldVisualization } from '../composables/useFieldVisualization.js'
import { useWaveAnimation } from '../composables/useWaveAnimation.js'
import { useHeatmap } from '../composables/useHeatmap.js'
import { useClippingPlane } from '../composables/useClippingPlane.js'
import { useScreenshot } from '../composables/useScreenshot.js'

import FieldControlPanel from './panels/FieldControlPanel.vue'
import WaveControlPanel from './panels/WaveControlPanel.vue'
import ClippingControlPanel from './panels/ClippingControlPanel.vue'
import ColorLegend from './ui/ColorLegend.vue'
import Icon from './ui/Icon.vue'

const container = ref(null)
const { scene, camera, renderer, controls, onTick } = useThreeScene(container, {
  background: 0x222223,
  cameraY: 2,
  cameraZ: 6,
})
const { progress, isLoading, load } = useModelLoader()
const { centerModel, frameCameraOnModel, disposeModel } = useModelUtils()
const raycast = useRaycast(camera, renderer)
const grid = useGridHelper(scene)
const fieldViz = useFieldVisualization(scene)
const wave = useWaveAnimation(scene, onTick)
const { applyHeatmap, clearHeatmap } = useHeatmap()
const clipping = useClippingPlane(renderer)
//const compToggle = useComponentToggle()
//const { ghostMode } = useTransparency()
const screenshot = useScreenshot(renderer)

let antennaModel = null
const showEField = ref(true)
const showHField = ref(true)
const vizMode = ref('vectors')
const ghostActive = ref(false)
const heatmapActive = ref(false)
const hoveredPartName = ref('')

onMounted(async () => {
  try {
    const gltf = await load('/models/antenna.glb')
    antennaModel = gltf.scene
  } catch (err) {
    console.warn('put a .glb at public/models/')
  }

  if (antennaModel) {
    antennaModel.scale.setScalar(1) // adjust per model. TODO: add UI input
    centerModel(antennaModel)
    frameCameraOnModel(antennaModel, camera.value, controls.value)
    scene.value.add(antennaModel)
    clipping.init()
    clipping.applyToModel(antennaModel, scene.value)

    raycast.enable([antennaModel], {
      onClick: (hit) => console.log('Clicked: ', hit.object.name, hit.point),
      onHover: (hit) => {
        hoveredPartName.value = hit.object.name || 'unnamed'
      },
      onHoverOut: () => {
        hoveredPartName.value = ''
      },
    })
  }

  grid.create({ size: 10, divisions: 20 })

  wave.createTransverseWave({
    length: 8,
    showEField: showEField.value,
    showHField: showHField.value,
    origin: new THREE.Vector3(0, 1.3, 0),
  })

  loadFieldData()
})

function generateFieldData() {
  const data = []
  for (let x = -3; x <= 3; x += 0.6) {
    for (let y = -3; y <= 3; y += 0.6) {
      for (let z = -3; z <= 3; z += 0.6) {
        const r = Math.sqrt(x * x + y * y + z * z) || 0.01
        if (r < 0.3) continue
        data.push({
          position: { x, y, z },
          direction: { x: x / r, y: y / r, z: z / r },
          magnitude: Math.min(1 / (r * r), 5),
        })
      }
    }
  }
  return data
}

function loadFieldData() {
  fieldViz.clearField()
  const data = generateFieldData()
  if (vizMode.value === 'vectors') fieldViz.renderVectorField(data, { scale: 0.3, maxArrows: 2000 })
  else if (vizMode.value === 'cloud') fieldViz.renderIntensityCloud(data, { pointSize: 0.06 })
}

function toggleEField() {
  showEField.value = !showEField.value
  rebuildWave()
}
function toggleHField() {
  showHField.value = !showHField.value
  rebuildWave()
}

function rebuildWave() {
  wave.clearWave()
  wave.createTransverseWave({
    length: 8,
    showEField: showEField.value,
    showHField: showHField.value,
    origin: new THREE.Vector3(-4, 0, 0),
  })
}

function setVizMode(mode) {
  vizMode.value = mode
  loadFieldData()
}
//function onComponentToggle(cat) { compToggle.toggleComponent(cat); if (antennaModel) compToggle.applyVisibility(antennaModel) }
//function onShowAllComponents() { compToggle.showAll(); if (antennaModel) compToggle.applyVisibility(antennaModel) }

function toggleGhost() {
  ghostActive.value = !ghostActive.value
  if (antennaModel) ghostMode(antennaModel, ghostActive.value)
}

function toggleHeatmap() {
  heatmapActive.value = !heatmapActive.value
  if (!antennaModel) return
  antennaModel.traverse((c) => {
    if (!c.isMesh) return
    heatmapActive.value
      ? applyHeatmap(c, (x, y, z) => Math.max(0, 1 - Math.sqrt(x * x + y * y + z * z) / 3))
      : clearHeatmap(c)
  })
}

onBeforeUnmount(() => {
  raycast.disable()
  fieldViz.clearField()
  wave.clearWave()
  grid.remove()
  if (antennaModel) disposeModel(antennaModel)
})

// Inline toolbar button (minimal, not worth its own file)
const ToolbarBtn = {
  props: { icon: String, label: String, active: Boolean },
  emits: ['click'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        {
          onClick: () => emit('click'),
          class: [
            'flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1',
            'text-[9px] font-medium tracking-wide transition-all duration-150',
            props.active
              ? 'bg-accent/12 text-accent'
              : 'text-text-muted hover:bg-surface-hover hover:text-text-secondary',
          ].join(' '),
        },
        [h(Icon, { name: props.icon, size: 'sm' }), h('span', {}, props.label)]
      )
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
