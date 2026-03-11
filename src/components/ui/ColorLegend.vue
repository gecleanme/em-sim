<template>
  <div
    class="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 rounded-lg border border-border/40 bg-surface/80 px-3.5 py-2 font-mono text-[9px] tracking-wide text-text-muted backdrop-blur-sm"
  >
    <span>{{ minLabel }}</span>
    <div class="h-2 w-40 rounded-full" :style="{ background: gradient }"></div>
    <span>{{ maxLabel }}</span>
  </div>
</template>

<script setup>
defineProps({
  minLabel: { type: String, default: 'Min' },
  maxLabel: { type: String, default: 'Max' },
})

const gradient = 'linear-gradient(to right, #004f59, #5ba8c8, #8ab87a, #d0debb, #f6b700, #e87461)'
</script>
