<script setup lang="ts">
import type { RegexCall, RegexDoctorResult, RegexInfo } from 'regex-doctor'
import { h } from 'vue'
import { decode, encode } from 'js-base64'

const props = defineProps<{
  info: RegexInfo
  payload: RegexDoctorResult
}>()

function getInputText(call: RegexCall) {
  return call.input?.map(i => typeof i === 'number' ? `\n--- ${i} chars truncated ---\n` : i.text).join('') || ''
}

function getBenchmarkLink(calls: RegexCall[] = props.info.callsInfos) {
  const payload = {
    config: {
      name: 'Performance Comparison from RegexDoctor',
      parallel: true,
      globalTestConfig: {
        dependencies: [],
      },
      dataCode: [
        '// Click "Run Tests" to start',
        `const regex = /${props.info.pattern}/${props.info.flags}`,
        `const inputs = [`,
        ...calls.flatMap((call, idx) => [
          `  // Input ${idx}`,
          `  ${JSON.stringify(getInputText(call))},`,
        ]),
        `]`,
        'return { regex, inputs }',
      ].join('\n'),
    },
    cases: calls.map((call, idx) => ({
      name: `Input ${idx}`,
      code: `DATA.regex.test(DATA.inputs[${idx}])`,
      dependencies: [],
    })),
  }
  // TODO: pref.link doesn't support unicode yet.
  try {
    return `https://jsbenchmark.com/#${encode((JSON.stringify(payload)), true)}`
  }
  catch (e) {
    console.error(e)
    return ''
  }
}

function getRegex101Link(call?: RegexCall) {
  const query = new URLSearchParams()
  query.set('regex', props.info.pattern)
  query.set('flags', props.info.flags)
  query.set('flavor', 'javascript')
  if (call?.input)
    query.set('testString', getInputText(call))
  return `https://regex101.com/?${query.toString()}`
}

const RenderInput = defineComponent({
  props: {
    call: {
      type: Object as PropType<RegexCall>,
      required: true,
    },
  },
  setup(props) {
    return () => h(
      'pre',
      {},
      (props.call.input || []).map(i =>
        typeof i === 'number'
          ? h('div', { style: 'opacity: 0.2' }, `--- ${i} chars truncated ---`)
          : h('span', { class: i.matched ? 'text-green bg-green:10 font-bold' : '' }, i.text),
      ),
    )
  },
})
</script>

<template>
  <div grid="~ rows-[max-content_max-content_1fr]" of-hidden h-full>
    <div p4 max-h-50 border="b base" of-auto>
      <a :href="getRegex101Link()" target="_blank" rel="noopener noreferrer">
        <ShikiInline
          :code="`/${info.pattern}/${info.flags}`"
          lang="js"
          max-w-90vw
        />
      </a>
    </div>
    <div p4 border="b base" grid="~ cols-7 gap-2">
      <DataField title="RegExp Length">
        <NumberDisplay :number="info.pattern.length" />
      </DataField>
      <DataField title="Total calls">
        <NumberDisplay :number="info.calls" colorful="large" />
      </DataField>
      <DataField title="Total copies">
        <NumberDisplay :number="info.copies" colorful="small" />
      </DataField>
      <DataField title="Total time cost">
        <DurationDisplay :ms="info.sum" />
        <PercentageDisplay v-if="payload" ml1 parens :value="info.sum / payload.totalDuration" />
      </DataField>
      <DataField title="Match rate">
        <PercentageDisplay :value="info.matchRate" />
      </DataField>
      <DataField title="Duration per 1k chars">
        <PercentageDisplay :value="info.dpk" />
      </DataField>
      <DataField v-if="getBenchmarkLink()" title="Performance Comparison">
        <a :href="getBenchmarkLink()" target="_blank" rel="noopener noreferrer" hover:underline>
          <span>jsbenchmark.com</span>
        </a>
      </DataField>
    </div>
    <div grid="~ cols-[2fr_1fr]" min-h-0>
      <div v-if="info.callsInfos.length" of-auto>
        <div px4 py2 border="b base">
          <span>Top {{ info.callsInfos.length }} Costly Calls</span>
        </div>
        <div flex="~ col" of-auto>
          <!-- eslint-disable-next-line vue/no-template-shadow -->
          <div v-for="call, idx of info.callsInfos" :key="idx" border="b base" p4 flex="~ gap-2">
            <div w-45 grid="~ cols-[max-content_1fr] gap-1 items-center" flex-none h-max>
              <div i-ph-timer-duotone op50 />
              <DurationDisplay :ms="call.duration" />

              <div i-ph-text-align-left-duotone op50 />
              <div op50>
                <NumberDisplay :number="call.inputLength" /> chars
              </div>

              <div i-ph-speedometer-duotone op50 flex-shrink-0 />
              <div>
                <DurationDisplay :ms="call.dpk" /> <span op50 text-sm>/ 1K chars</span>
              </div>

              <div :class="call.matched ? 'text-green i-ph-check-circle-duotone' : 'text-orange i-ph-x-circle-duotone'" />
              <div :class="call.matched ? 'text-green' : 'op50'">
                {{ call.matched ? 'Matched' : 'Not matched' }}
              </div>

              <template v-if="call.groups">
                <div i-ph-brackets-round-duotone op50 />
                <div op50>
                  {{ call.groups }} groups
                </div>
              </template>

              <div i-ph-list-magnifying-glass-duotone op50 />
              <div>
                <a
                  :href="getRegex101Link(call)"
                  target="_blank" rel="noopener noreferrer"
                  op50 hover:underline hover:op100
                >
                  Test on Regex101
                </a>
              </div>
            </div>
            <a
              :href="getRegex101Link(call)" target="_blank" rel="noopener noreferrer"
              w-full block bg-gray:5 px2 py1 border="~ base rounded" of-auto font-mono h-max
              text-zinc
            >
              <RenderInput :call="call" />
            </a>
          </div>
        </div>
      </div>
      <div border="l base" of-auto>
        <RegexSources
          :info="info" :payload="payload"
        />
      </div>
    </div>
  </div>
</template>
