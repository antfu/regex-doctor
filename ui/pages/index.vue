<script setup lang="ts">
import type { SerializedRegExpInfo } from '../../src/types'

const data = await $fetch('/api/payload') as SerializedRegExpInfo[]
</script>

<template>
  <div flex="~ gap-2" p4>
    <RegexInfo v-for="info, key of data" :key :info />
  </div>
</template>
