<template>
  <div class="border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
    <button
      @click="open = !open"
      class="flex w-full items-center justify-between py-1 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary transition-colors hover:text-accent"
    >
      <span class="flex items-center gap-1.5">
        <Icon :name="icon" size="xs" />
        {{ title }}
      </span>
      <Icon name="expand_more" size="xs" :class="{ 'rotate-180': open }" class="transition-transform duration-200" />
    </button>
    <div v-show="open" class="mt-2 flex flex-col gap-2.5">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'

defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'settings' },
})

const open = ref(true)
</script>
