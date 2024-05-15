<script setup lang="ts">
const props = defineProps<{
  value: number
  parens?: boolean
}>()

const color = computed(() => {
  if (props.value >= 0.8)
    return 'text-green'
  if (props.value >= 0.5)
    return 'text-emerald'
  if (props.value >= 0.2)
    return 'text-teal'
  return 'op50'
})

const num = computed(() => props.value * 100)
const integer = computed(() => Math.floor(num.value))
const decimal = computed(() => Math.round((num.value - integer.value) * 100))
</script>

<template>
  <span :class="color">
    <span v-if="props.parens" op50>(</span>
    <span>{{ integer }}</span>
    <span v-if="decimal" op75 text-sm>.{{ decimal }}</span>
    <span text-sm op50>%</span>
    <span v-if="props.parens" op50>)</span>
  </span>
</template>
