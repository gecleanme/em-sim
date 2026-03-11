<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <label class="text-[10px] font-medium text-text-secondary">{{ label }}</label>
      <span class="font-mono text-[10px] text-accent tabular-nums">{{ displayValue }}{{ unit ? ` ${unit}` : '' }}</span>
    </div>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="$emit('update:modelValue', parseFloat($event.target.value))"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  modelValue: Number,
  min: { type: Number, default: 0 },
  max: { type: Number, default: 1 },
  step: { type: Number, default: 0.01 },
  unit: { type: String, default: '' },
  decimals: { type: Number, default: 2 },
})

defineEmits(['update:modelValue'])
const displayValue = computed(() => props.modelValue.toFixed(props.decimals))
</script>
