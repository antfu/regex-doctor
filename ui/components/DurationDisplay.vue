<script setup lang="ts">
const props = defineProps<{
  ms: number
}>()

const unit = ref('')
const number = ref(0)

watchEffect(() => {
  const ms = props.ms
  if (ms < 0.01) {
    unit.value = 'ns'
    number.value = ms * 1e6
  }
  else if (ms < 10) {
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
</script>

<template>
  <code>
    {{ number.toFixed(2) }}<span op50 text-sm>{{ unit }}</span>
  </code>
</template>
