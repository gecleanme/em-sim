<template>
  <PanelSection title="Cross-Section" icon="content_cut">
    <label class="flex cursor-pointer items-center gap-2 text-[11px] text-text-primary">
      <input
        type="checkbox"
        :checked="enabled"
        @change="$emit('update:enabled', $event.target.checked)"
        class="accent-accent"
      />
      Enable Slice
    </label>

    <template v-if="enabled">
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-medium text-text-secondary">Axis</span>
        <div class="flex gap-1">
          <button
            v-for="a in ['x', 'y', 'z']"
            :key="a"
            @click="$emit('update:axis', a)"
            class="flex-1 rounded px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold uppercase transition-colors"
            :class="
              axis === a
                ? axisStyle[a]
                : 'bg-surface-raised text-text-muted border border-border hover:border-border-bright'
            "
          >
            {{ a }}
          </button>
        </div>
      </div>

      <SliderControl
        label="Position"
        :min="-5"
        :max="5"
        :step="0.05"
        :decimals="2"
        :model-value="position"
        @update:model-value="$emit('update:position', $event)"
      />

      <label class="flex cursor-pointer items-center gap-2 text-[11px] text-text-primary">
        <input
          type="checkbox"
          :checked="flipped"
          @change="$emit('update:flipped', $event.target.checked)"
          class="accent-accent"
        />
        Flip Direction
      </label>
    </template>
  </PanelSection>
</template>

<script setup>
import PanelSection from '../ui/PanelSection.vue'
import SliderControl from '../ui/SliderControl.vue'

defineProps({
  enabled: Boolean,
  axis: { type: String, default: 'x' },
  position: Number,
  flipped: Boolean,
})

defineEmits(['update:enabled', 'update:axis', 'update:position', 'update:flipped'])

const axisStyle = {
  x: 'bg-e-field/12 text-e-field border border-e-field/25',
  y: 'bg-accent/12 text-accent border border-accent/25',
  z: 'bg-h-field/12 text-h-field border border-h-field/25',
}
</script>
