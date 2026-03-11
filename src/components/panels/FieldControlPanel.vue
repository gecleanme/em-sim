<template>
  <PanelSection title="Field Display" icon="electric_bolt">
    <div class="flex gap-3">
      <label class="flex cursor-pointer items-center gap-1.5 text-[11px] text-text-primary">
        <input type="checkbox" :checked="showEField" @change="$emit('toggle-e-field')" class="accent-e-field" />
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-e-field"></span>
        E-Field
      </label>
      <label class="flex cursor-pointer items-center gap-1.5 text-[11px] text-text-primary">
        <input type="checkbox" :checked="showHField" @change="$emit('toggle-h-field')" class="accent-h-field" />
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-h-field"></span>
        H-Field
      </label>
    </div>

    <div class="flex flex-col gap-1">
      <span class="text-[10px] font-medium text-text-secondary">Mode</span>
      <div class="flex gap-1">
        <button
          v-for="m in modes"
          :key="m.value"
          @click="$emit('set-mode', m.value)"
          class="rounded px-2 py-0.5 text-[10px] font-medium transition-colors"
          :class="
            vizMode === m.value
              ? 'bg-accent/15 text-accent border border-accent/25'
              : 'bg-surface-raised text-text-muted border border-border hover:border-border-bright'
          "
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <SliderControl label="Min Intensity" :min="0" :max="1" :step="0.01" v-model="localThreshold" />
  </PanelSection>
</template>

<script setup>
import { ref, watch } from 'vue'
import PanelSection from '../ui/PanelSection.vue'
import SliderControl from '../ui/SliderControl.vue'

defineProps({
  showEField: Boolean,
  showHField: Boolean,
  vizMode: { type: String, default: 'vectors' },
})

const emit = defineEmits(['toggle-e-field', 'toggle-h-field', 'set-mode', 'set-threshold'])

const modes = [
  { value: 'vectors', label: 'Arrows' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'none', label: 'Off' },
]

const localThreshold = ref(0)
watch(localThreshold, (v) => emit('set-threshold', v))
</script>
