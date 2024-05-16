<script setup lang="ts">
defineProps<{
  sorted: boolean | null
  sortOrder: number
}>()
</script>

<template>
  <div v-if="!sorted" i-ph-arrows-down-up-duotone mr--1 />
  <div v-else-if="sortOrder === 1" i-ph-sort-descending-duotone mr--1 />
  <div v-else i-ph-sort-ascending-duotone mr--1 />
</template>
