<script lang="ts" setup>
import OverlayPanel from 'primevue/overlaypanel'
import Dropdown from 'primevue/dropdown'
import type { RegexInfo } from 'regex-doctor'

interface Condition {
  property: keyof RegexInfo
  condition: string
  value: string
}

export type ConditionGetter = (item: RegexInfo) => boolean

const emits = defineEmits<{
  (event: 'filter', conditions: ConditionGetter[]): void
}>()

const overlayRef = shallowRef<InstanceType<typeof OverlayPanel>>()

const conditions = ref<Condition[]>([])

// Last screening condition
let prevConditions: Condition[] = []

const propertyOptions = [
  { label: 'Regex', value: 'pattern' },
  { label: 'Calls', value: 'calls' },
  { label: 'Copies', value: 'copies' },
  { label: 'Groups', value: 'groups' },
  { label: 'Total', value: 'sum' },
  { label: 'Avg', value: 'avg' },
  { label: 'Max', value: 'max' },
  { label: 'Min', value: 'min' },
  { label: 'Dpk', value: 'dpk' },
]

const conditionOptions = [
  { label: 'Equal', value: 'EQ' },
  { label: 'Greater', value: 'GT' },
  { label: 'Less', value: 'LT' },
  { label: 'Greater Equal', value: 'GE' },
  { label: 'Less Equal', value: 'LE' },
  { label: 'Includes', value: 'IN' },
  { label: 'Excludes', value: 'EX' },
]

function onValueInputTypeGetter({ condition }: Condition) {
  return ['GT', 'LT', 'GE', 'LE'].includes(condition) ? 'number' : 'text'
}

function hasConditionDifference() {
  if (conditions.value.length !== prevConditions.length)
    return true

  for (let i = 0; i < conditions.value.length; i++) {
    const condition = conditions.value[i]
    const prevCondition = prevConditions[i]

    if (
      condition.property !== prevCondition.property
      || condition.condition !== prevCondition.condition
      || condition.value !== prevCondition.value
    )
      return true
  }
}

function onFilterClick(ev: MouseEvent) {
  overlayRef.value!.toggle(ev)
}

function generateGetter({ property, condition, value }: Condition) {
  return (rowData: RegexInfo) => {
    const rowDataValue = rowData[property] as any

    if (condition === 'IN')
      return rowDataValue.includes(value)
    else if (condition === 'EX')
      return !rowDataValue.includes(value)
    else if (condition === 'EQ')
      return rowDataValue === value
    else if (condition === 'GT')
      return rowDataValue > value
    else if (condition === 'LT')
      return rowDataValue < value
    else if (condition === 'GE')
      return rowDataValue >= value
    else if (condition === 'LE')
      return rowDataValue <= value
    else
      return true
  }
}

function onOverlayShow() {
  // If conditions is empty, add a default condition
  if (!conditions.value.length)
    conditions.value = [{ property: 'pattern', condition: 'IN', value: '' }]

  prevConditions = conditions.value.map(v => structuredClone(toRaw(v)))
}

function onOverlayHide() {
  conditions.value = conditions.value.filter(v => v.value)

  if (hasConditionDifference())
    emits('filter', conditions.value.map(generateGetter))
}

function onCreateCondition() {
  conditions.value.push({
    property: propertyOptions[0].value as keyof RegexInfo,
    condition: 'EQ',
    value: '',
  })
}

function onRemoveCondition(conditionIndex: number) {
  conditions.value.splice(conditionIndex, 1)
}
</script>

<template>
  <button class="op-80" :class="[conditions.length ? 'i-ph-magnifying-glass-fill' : 'i-ph-magnifying-glass']" @click="onFilterClick" />

  <OverlayPanel
    ref="overlayRef"
    trigger="click"
    b="~ solid gray/20"
    bg-base rounded-md m-1 p-1 min-w-407px
    shadow-md
    max-h-300px
    of-auto
    @show="onOverlayShow"
    @hide="onOverlayHide"
  >
    <div flex="~ items-center justify-between" mb-1 sticky top-0 z-1 bg-base>
      <span text-sm op-50 pl-1>
        Filter Data
      </span>

      <div inline-flex p-1 hover="bg-gray/15" rounded @click="onCreateCondition">
        <button i-ph-plus-bold cursor-default op-50 />
      </div>
    </div>

    <div v-for="(row, idx) of conditions" :key="idx" flex="~ items-center justify-between gap-1" text-sm not="last-mb-1">
      <Dropdown
        v-model="row.property"
        :options="propertyOptions" option-label="label"
        option-value="value"
        flex="~ items-center"
        b="~ solid gray/20"
        py-1 px-2
        flex-shrink-0
        w-30
        min-w-30
        rounded
        cursor-default
        placeholder="Property"
      />
      <Dropdown
        v-model="row.condition"
        :options="conditionOptions"
        option-label="label"
        option-value="value"
        flex="~ items-center"
        b="~ solid gray/20"
        py-1 px-2
        flex-shrink-0
        w-30
        min-w-30
        rounded
        cursor-default
        placeholder="Condition"
      />

      <input
        v-model="row.value"
        :type="onValueInputTypeGetter(row)"
        bg="transparent"
        b="~ solid gray/20"
        py-1 px-2
        flex-shrink-0
        w-30
        rounded
        outline-none
        class="focus:!b-gray/80"
        cursor-default
      >

      <div flex="~ items-center justify-center" p-1 flex-shrink-0 rounded hover="bg-gray/15">
        <button i-ph-trash text-red-500 cursor-default @click="onRemoveCondition(idx)" />
      </div>
    </div>
  </OverlayPanel>
</template>

<style>
.p-dropdown {
  @apply relative pr-6;
}

.p-dropdown-items-wrapper {
  @apply bg-base mt-0.5 p-1 b-1 b-solid b-gray/20 rounded-md shadow-md text-sm of-auto;
}

.p-dropdown-item {
  @apply relative py-1 px-2 hover:bg-gray/10 rounded cursor-default;
}

.p-placeholder {
  @apply text-gray/60;
}

.p-dropdown-trigger {
  @apply absolute op-50 right-1.5;
}
</style>
