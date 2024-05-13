<script setup lang="ts">
import type { RegexDoctorResult } from 'regex-doctor'

const payload = Object.freeze(await $fetch('/api/payload') as RegexDoctorResult)
</script>

<template>
  <div p4 border="b base rounded">
    <span font-bold>Regex</span><span font-100>Doctor</span>
  </div>
  <div p4 border="b base rounded" grid="~ cols-8">
    <DataField title="Unique regexes">
      <NumberDisplay :number="payload.countUnique" />
    </DataField>
    <DataField title="Regex instances">
      <NumberDisplay :number="payload.count" />
    </DataField>
    <DataField title="Regexes with details">
      <NumberDisplay :number="payload.regexInfos.length" />
    </DataField>
    <DataField title="Total time in regex">
      <DurationDisplay :ms="payload.totalDuration" />
    </DataField>
  </div>
  <div py4>
    <RegexTable :payload="payload" />
  </div>
</template>
