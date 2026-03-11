<template>
  <PanelSection title="Wave Parameters" icon="waves">
    <SliderControl
      label="Frequency"
      unit="Hz"
      :min="0.1"
      :max="5"
      :step="0.1"
      :decimals="1"
      :model-value="frequency"
      @update:model-value="$emit('update:frequency', $event)"
    />
    <SliderControl
      label="Wavelength"
      unit="m"
      :min="0.5"
      :max="6"
      :step="0.1"
      :decimals="1"
      :model-value="wavelength"
      @update:model-value="$emit('update:wavelength', $event)"
    />
    <SliderControl
      label="Amplitude"
      unit="V/m"
      :min="0.1"
      :max="2"
      :step="0.05"
      :decimals="2"
      :model-value="amplitude"
      @update:model-value="$emit('update:amplitude', $event)"
    />
    <SliderControl
      label="Prop. Speed"
      unit="c"
      :min="0.1"
      :max="3"
      :step="0.1"
      :decimals="1"
      :model-value="speed"
      @update:model-value="$emit('update:speed', $event)"
    />

    <button
      @click="$emit('toggle-animation')"
      class="mt-0.5 flex items-center justify-center gap-1.5 rounded border px-3 py-1 text-[10px] font-medium transition-colors"
      :class="
        isAnimating
          ? 'border-accent/25 bg-accent/10 text-accent hover:bg-accent/15'
          : 'border-border bg-surface-raised text-text-muted hover:border-border-bright'
      "
    >
      <Icon :name="isAnimating ? 'pause' : 'play_arrow'" size="xs" />
      {{ isAnimating ? 'Pause' : 'Play' }}
    </button>
  </PanelSection>
</template>

<script setup>
import PanelSection from '../ui/PanelSection.vue'
import SliderControl from '../ui/SliderControl.vue'
import Icon from '../ui/Icon.vue'

defineProps({
  frequency: Number,
  wavelength: Number,
  amplitude: Number,
  speed: Number,
  isAnimating: Boolean,
})

defineEmits(['update:frequency', 'update:wavelength', 'update:amplitude', 'update:speed', 'toggle-animation'])
</script>
