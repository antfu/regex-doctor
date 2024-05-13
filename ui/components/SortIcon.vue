<script setup lang="ts">
defineProps<{
  sorted: boolean
  sortOrder: number
}>()
</script>

<template>
  <div v-if="!sorted" i-ph-arrows-down-up-duotone />
  <div v-else-if="sortOrder === 1" i-ph-sort-descending-duotone />
  <div v-else i-ph-sort-ascending-duotone />
</template>
