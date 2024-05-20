<script lang="ts" setup>
import OverlayPanel from 'primevue/overlaypanel'
import Dropdown from 'primevue/dropdown'

interface Condition {
  property: string
  condition: string
  value: string
}

const overlayRef = shallowRef()

const conditions = ref<Condition[]>([])
// const uniqueConditions = useArrayUnique(conditions.value, (a, b) => a.property === b.property)

const propertyOptions = [
  { label: 'Regex', value: 'regex' },
  { label: 'Calls', value: 'calls' },
  { label: 'Dpk', value: 'dpk' },
  // ...
]

const conditionOptions = [
  { label: 'Equal', value: 'EQ' },
  { label: 'Greater', value: 'GT' },
  { label: 'Less', value: 'LT' },
  { label: 'Greater or Equal', value: 'GE' },
  { label: 'Less or Equal', value: 'LE' },
  { label: 'Includes', value: 'IN' },
  { label: 'Excludes', value: 'EX' },
]

function onValueInputTypeGetter({ condition }: Condition) {
  return ['GT', 'LT'].includes(condition) ? 'number' : 'text'
}

function onFilterClick(ev) {
  overlayRef.value.toggle(ev)
}

function onOverlayShow() { }

function onOverlayHide() { }

function onCreateCondition() {
  conditions.value.push({
    property: '',
    condition: 'EQ',
    value: '',
  })
}

function onRemoveCondition(conditionIndex) {
  conditions.value.splice(conditionIndex, 1)
}
</script>

<template>
  <button class="op-80" :class="[conditions.length ? 'i-ph-magnifying-glass-fill' : 'i-ph-magnifying-glass']" @click="onFilterClick" />

  <OverlayPanel
    ref="overlayRef"
    append-to="self"
    trigger="click"
    class="bg-base rounded-md m-1 p-1 min-w-407px"
    b="~ solid gray/20"
    shadow-md
    max-h-300px
    of-auto
    @show="onOverlayShow"
    @hide="onOverlayHide"
  >
    <div class="flex items-center justify-between" mb-1 sticky top-0 z-1 bg-base>
      <span text-sm op-50 pl-1>
        Filter Data
      </span>

      <div inline-flex p-1 hover="bg-gray/15" rounded>
        <button i-ph-plus-bold cursor-default @click="onCreateCondition" />
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

      <button i-ph-trash text-red-500 p-1 flex-shrink-0 cursor-default mx-1 @click="onRemoveCondition(idx)" />
    </div>
  </OverlayPanel>
</template>

<style>
.p-dropdown {
  @apply relative pr-6;
}

.p-dropdown-items-wrapper {
  @apply bg-base mt-1 p-1 b-1 b-solid b-gray/20 rounded-md shadow-md text-sm;
}

.p-dropdown-item {
  @apply relative p-1 hover:bg-gray/10 rounded cursor-default;
}

.p-dropdown-trigger {
  @apply absolute op-50 right-1.5;
}
</style>
