<template>
  <span
    class="material-symbols-outlined select-none leading-none"
    :class="classes"
    :style="filled ? { fontVariationSettings: `'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 20` } : {}"
  >
    {{ name }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'sm' },
  filled: { type: Boolean, default: false },
})

const sizeMap = { xs: 'text-sm', sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
const classes = computed(() => sizeMap[props.size] || 'text-lg')
</script>
