<script setup lang="ts">
import type { SerializedRegExpInfo } from '../../src/types'

const props = defineProps<{
  info: SerializedRegExpInfo
}>()

const duration = computed(() => {
  let all = 0
  let max = 0
  let min = Number.POSITIVE_INFINITY
  for (const call of props.info.calls) {
    all += call.duration
    max = Math.max(max, call.duration)
    min = Math.min(min, call.duration)
  }
  const avg = all / props.info.calls.length
  return {
    all,
    avg,
    max,
    min,
  }
})
</script>

<template>
  <div
    border="~ gray/50 rounded"
    flex="~ col"
  >
    <Shiki
      p2
      :code="`/${info.regex.pattern}/${info.regex.flags}`"
      lang="js"
    />
    <div border="t gray/50" p2>
      <div
        v-if="info.calls.length"
        w-40
        font-mono text-right
        grid="~ cols-[max-content_1fr] gap-2 items-center"
      >
        <div op50 text-sm uppercase>
          NUM
        </div>
        <div>
          {{ info.calls.length }}
        </div>
        <div op50 text-sm uppercase>
          SUM
        </div>
        <DurationDisplay :ms="duration.all" />
        <template v-if="info.calls.length > 1">
          <div op50 text-sm uppercase>
            Avg
          </div>
          <DurationDisplay :ms="duration.avg" />
          <div op50 text-sm uppercase>
            Max
          </div>
          <DurationDisplay :ms="duration.max" />
          <div op50 text-sm uppercase>
            Min
          </div>
          <DurationDisplay :ms="duration.min" />
        </template>
      </div>
    </div>
  </div>
</template>
