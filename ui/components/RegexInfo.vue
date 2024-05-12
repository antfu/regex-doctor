<script setup lang="ts">
import type { SerializedRegExpInfo } from '../../src/types'

defineProps<{
  info: SerializedRegExpInfo
}>()
</script>

<template>
  <div
    border="~ gray/50 rounded"
    flex="~ col" w-100
  >
    <Shiki
      p2
      :code="`/${info.regex.pattern}/${info.regex.flags}`"
      lang="js"
      of-auto text-wrap line-clamp-3
    />
    <div border="t gray/50" p2 grid="~ cols-2 gap-10 items-start">
      <div
        font-mono text-right
        grid="~ cols-[max-content_1fr] gap-2 items-center"
      >
        <div op50 text-sm uppercase>
          NUM
        </div>
        <div>
          {{ info.durations.count }}
        </div>
        <div op50 text-sm uppercase>
          SUM
        </div>
        <DurationDisplay :ms="info.durations.sum" />
      </div>
      <div
        font-mono text-right
        grid="~ cols-[max-content_1fr] gap-2 items-center"
      >
        <div op50 text-sm uppercase>
          Avg
        </div>
        <DurationDisplay :ms="info.durations.avg" />
        <div op50 text-sm uppercase>
          Max
        </div>
        <DurationDisplay :ms="info.durations.max" />
        <div op50 text-sm uppercase>
          Min
        </div>
        <DurationDisplay :ms="info.durations.min" />
      </div>
    </div>
    <div v-if="info.files?.length" border="t gray/50" p2 of-hidden>
      <a v-for="f in info.files" :key="f" font-mono text-wrap>
        {{ f }}
      </a>
    </div>
  </div>
</template>
