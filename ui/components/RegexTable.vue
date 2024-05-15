<script setup lang="ts">
import type { RegexDoctorResult, RegexInfo } from 'regex-doctor'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { Dropdown } from 'floating-vue'

const props = defineProps<{
  payload: RegexDoctorResult
}>()

const filters = reactive({
  package: '',
})

const filtered = computed(() => {
  let list = props.payload.regexInfos

  if (filters.package)
    list = list.filter(item => item.packages?.includes(filters.package))

  return list
})

const currentRegex = shallowRef<RegexInfo | null>(null)
</script>

<template>
  <DataTable :value="filtered.slice(0, 100)" data-key="no" table-class="w-full text-right data-table">
    <Column field="dynamic" header="Dynamic" header-class="pl4">
      <template #body="{ data }">
        <PackageNameDisplay v-if="data.dynamic" name="new" />
      </template>
    </Column>
    <Column field="regex" header="Regex" class="text-left" header-class="pl4 [&>*]:justify-start">
      <template #body="{ data }">
        <button flex h-full pl2 @click="currentRegex = data">
          <ShikiInline
            :code="`/${data.regex.pattern}/${data.regex.flags}`"
            lang="js" text-gray:50
            of-hidden max-w-150 text-ellipsis ws-nowrap mya
          />
        </button>
      </template>
    </Column>
    <Column field="calls" header="Calls" sortable>
      <template #body="{ data }">
        <NumberDisplay :number="data.calls" colorful="large" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="copies" header="Copies" sortable>
      <template #body="{ data }">
        <NumberDisplay :number="data.copies" colorful="small" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="summary.sum" header="Total" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.summary.sum" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="summary.avg" header="Avg" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.summary.avg" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="summary.max" header="Max" sortable>
      <template #body="{ data }">
        <button @click="currentRegex = data">
          <DurationDisplay :ms="data.summary.max" />
        </button>
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="summary.min" header="Min" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.summary.min" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="summary.matchRate" header="Matches" sortable>
      <template #body="{ data }">
        <PercentageDisplay :value="data.summary.matchRate" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="files" header="Used in" sortable header-class="pr-4">
      <template #body="{ data }">
        <div flex="~ gap-1 items-center justify-end">
          <Dropdown>
            <button pr-4 font-mono flex="~ gap-1 items-center justify-end">
              <div flex="inline gap-2 justify-end wrap" max-w-80>
                <PackageNameDisplay v-for="name in data.packages" :key="name" :name="name" />
              </div>
              <div
                v-if="data.filesCreated?.length" i-ph-file-code-duotone text-purple
                title="Regex creation source"
              />
              <div op50 i-ph-files-duotone />
              {{ data.filesCalled?.length }}
            </button>
            <template #popper>
              <div text-sm>
                <RegexSources
                  :info="data" :payload="payload"
                  @select-package="pkg => filters.package = pkg"
                />
              </div>
            </template>
          </Dropdown>
        </div>
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
  </DataTable>
  <div
    v-if="currentRegex"
    fixed w-screen h-screen inset-0 flex backdrop-blur-5px z-100
  >
    <div absolute inset-0 bg-black:10 z--1 @click="currentRegex = null" />
    <div bg-base shadow ma w-80vw h-80vh border="~ base rounded" of-auto>
      <RegexDetail :info="currentRegex" :payload="payload" />
    </div>
  </div>
</template>
