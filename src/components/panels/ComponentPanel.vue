<template>
  <PanelSection title="Components" icon="build">
    <label
      v-for="(visible, cat) in components"
      :key="cat"
      class="flex cursor-pointer items-center gap-2 text-[11px] text-text-primary transition-colors hover:text-accent"
    >
      <input type="checkbox" :checked="visible" @change="$emit('toggle', cat)" class="accent-accent" />
      {{ formatLabel(cat) }}
    </label>
    <button
      @click="$emit('show-all')"
      class="mt-0.5 w-full rounded border border-border bg-surface-raised px-2 py-0.5 text-[10px] text-text-muted transition-colors hover:border-border-bright hover:text-text-primary"
    >
      Show All
    </button>
  </PanelSection>
</template>

<script setup>
import PanelSection from '../ui/PanelSection.vue'

defineProps({ components: { type: Object, required: true } })
defineEmits(['toggle', 'show-all'])

function formatLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>
