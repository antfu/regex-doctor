<script setup lang="ts">
import { version } from '../../package.json'

const payload = Object.freeze(await $fetch('/api/payload.json'))
</script>

<template>
  <div h-full flex="~ col">
    <div p4 border="b base rounded">
      <div>
        <span font-bold>Regex</span><span font-100>Doctor</span> <sup op50>v{{ version }}</sup>
      </div>
      <div v-if="payload.cwd" font-mono text-xs op50>
        {{ payload.cwd }}
      </div>
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
      <DataField title="Total regex execution time">
        <DurationDisplay :ms="payload.totalExecution" :colorful="false" />
        <PercentageDisplay ml1 parens :value="payload.totalExecution / payload.totalDuration" />
      </DataField>
      <DataField title="Total time of the process">
        <DurationDisplay :ms="payload.totalDuration" :colorful="false" />
      </DataField>
    </div>
    <div flex-1>
      <RegexTable :payload="payload" />
    </div>
  </div>
</template>
