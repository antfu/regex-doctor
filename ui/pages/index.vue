<script setup lang="ts">
import type { SerializedRegexDoctorResult } from '../../src/types'

const data = Object.freeze(await $fetch('/api/payload') as SerializedRegexDoctorResult)
</script>

<template>
  <div p4 m4 border="~ gray/50 rounded">
    Number of regexes: {{ data.count }}<br>
    Total time in regex: <DurationDisplay :ms="data.totalDuration" />
  </div>
  <div flex="~ gap-2 wrap" p4>
    <RegexInfo v-for="info, key of data.regexes" :key :info />
  </div>
</template>
