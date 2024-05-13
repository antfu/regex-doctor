<script setup lang="ts">
defineProps<{
  title: string
  value?: any
}>()
</script>

<template>
  <div>
    <div text-xs op50>
      {{ title }}
    </div>
    <div text-sm>
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>
