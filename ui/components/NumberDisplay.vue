<script setup lang="ts">
const props = defineProps<{
  number: number
  colorful?: 'large' | 'small'
}>()

const formatter = new Intl.NumberFormat()

const formatted = computed(() => props.number === 0 ? '-' : formatter.format(props.number))

const colorScales = {
  large: [
    [10000, 'text-red'],
    [5000, 'text-orange'],
    [1000, 'text-yellow'],
    [1, ''],
    [0, 'op25'],
  ],
  small: [
    [1000, 'text-red'],
    [500, 'text-orange'],
    [100, 'text-yellow'],
    [1, ''],
    [0, 'op25'],
  ],
} as const

const color = computed(() => {
  if (!props.colorful)
    return ''
  const scales = colorScales[props.colorful]
  for (const [limit, color] of scales) {
    if (props.number >= limit)
      return color
  }
  return ''
})
</script>

<template>
  <span :class="color">{{ formatted }}</span>
</template>
