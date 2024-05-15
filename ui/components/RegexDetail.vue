<script setup lang="ts">
import type { RegexCall, RegexDoctorResult, RegexInfo } from 'regex-doctor'

const props = defineProps<{
  info: RegexInfo
  payload?: RegexDoctorResult
}>()

function getRegex101Link(call?: RegexCall) {
  const query = new URLSearchParams()
  query.set('regex', props.info.regex.pattern)
  query.set('flags', props.info.regex.flags)
  query.set('flavor', 'javascript')
  if (call?.input)
    query.set('testString', call?.input.map(i => typeof i === 'string' ? i : `...${i} chars`).join('\n'))
  return `https://regex101.com/?${query.toString()}`
}
</script>

<template>
  <div flex="~ col">
    <div p4 max-h-50 border="b base" of-auto>
      <a :href="getRegex101Link()" target="_blank" rel="noopener noreferrer">
        <ShikiInline
          :code="`/${info.regex.pattern}/${info.regex.flags}`"
          lang="js"
          max-w-90vw
        />
      </a>
    </div>
    <div p4 border="b base" grid="~ cols-4 gap-2">
      <DataField title="RegExp Length">
        <NumberDisplay :number="info.regex.pattern.length" />
      </DataField>
      <DataField title="Total calls">
        <NumberDisplay :number="info.calls" colorful="large" />
      </DataField>
      <DataField title="Total cost">
        <DurationDisplay :ms="info.durations.sum" />
        <span v-if="payload" op50 ml1>({{ (info.durations.sum / payload.totalDuration * 100).toFixed(2) }}%)</span>
      </DataField>
    </div>
    <div v-if="info.callsInfos.length">
      <div px4 py2 border="b base">
        <span>Top {{ info.callsInfos.length }} Calls</span>
      </div>
      <div flex="~ col">
        <div v-for="call, idx of info.callsInfos" :key="idx" border="b base" p4 flex="~ gap-2">
          <div w-30 flex="~ col none">
            <DurationDisplay :ms="call.duration" />
            <div op50>
              <NumberDisplay :number="call.inputLength" /> chars
            </div>
            <div>
              <span :class=" call.matched ? 'text-green' : 'text-orange'">{{ call.matched ? 'matched' : 'not matched' }}</span>
            </div>
            <div v-if="call.groups">
              <span text-blue>{{ call.groups }} groups</span>
            </div>
          </div>
          <a
            :href="getRegex101Link(call)" target="_blank" rel="noopener noreferrer"
            w-full block bg-gray:5 px3 py1 border="~ base rounded" of-auto font-mono
          >
            <template v-for="i, idx of call.input" :key="idx">
              <pre v-if="typeof i === 'string'" v-text="i" />
              <div v-else op50 text-orange>(...{{ i }} char truncated)</div>
            </template>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
