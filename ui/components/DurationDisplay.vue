<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    ms: number
    colorful?: boolean
  }>(),
  {
    colorful: true,
  },
)

const unit = ref('')
const number = ref(0)

watchEffect(() => {
  const ms = props.ms
  if (ms < 0.1) {
    unit.value = 'μs'
    number.value = ms * 1e3
  }
  else if (ms < 1000) {
    unit.value = 'ms'
    number.value = ms
  }
  else if (ms < 60 * 1000) {
    unit.value = 's'
    number.value = ms / 1000
  }
  else if (ms < 60 * 60 * 1000) {
    unit.value = 'm'
    number.value = ms / 1000 / 60
  }
  else {
    unit.value = 'h'
    number.value = ms / 1000 / 60 / 60
  }
})

const color = computed(() => {
  if (props.colorful === false)
    return ''
  if (props.ms > 0.5)
    return 'text-red'
  if (props.ms > 0.2)
    return 'text-orange'
  if (props.ms > 0.1)
    return 'text-yellow'
  if (unit.value === 'μs')
    return 'op50 text-sm'
  return ''
})
</script>

<template>
  <code :class="color">
    {{ number.toFixed(2) }}<span op50 text-sm ml-3px>{{ unit }}</span>
  </code>
</template>
