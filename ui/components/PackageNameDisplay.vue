<script setup lang="ts">
import { getHashColorFromString } from '../../src/shared/color'

const props = defineProps<{
  name: string
}>()

const colorMode = useColorMode()

const style = computed(() => ({
  color: getHashColorFromString(props.name || '', 1, colorMode.value === 'dark'),
  backgroundColor: getHashColorFromString(props.name || '', 0.1, colorMode.value === 'dark'),
}))
</script>

<template>
  <code :style="style" px1 rounded text-sm>{{ name }}</code>
</template>
