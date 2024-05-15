<script setup lang="ts">
import type { RegexDoctorResult, RegexInfo } from 'regex-doctor'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { Dropdown, Tooltip } from 'floating-vue'

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
        <Tooltip>
          <button flex h-full pl2 @click="currentRegex = data">
            <ShikiInline
              :code="`/${data.regex.pattern}/${data.regex.flags}`"
              lang="js" text-gray:50
              of-hidden max-w-150 text-ellipsis ws-nowrap mya
            />
          </button>
          <template #popper>
            <div p2>
              <ShikiInline
                :code="`/${data.regex.pattern}/${data.regex.flags}`"
                lang="js"
                max-w-90vw
              />
            </div>
          </template>
        </Tooltip>
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
    <Column field="durations.sum" header="Total" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.durations.sum" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="durations.avg" header="Avg" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.durations.avg" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="durations.max" header="Max" sortable>
      <template #body="{ data }">
        <button @click="currentRegex = data">
          <DurationDisplay :ms="data.durations.max" />
        </button>
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="durations.min" header="Min" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.durations.min" />
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
                <div v-if="data.packages?.length" p3 border="b base" flex="~ col gap-2 items-start">
                  <div op50 text-sm>
                    Packages
                  </div>
                  <div flex="inline gap-2 wrap">
                    <button v-for="name in data.packages" :key="name" @click="filters.package = name">
                      <PackageNameDisplay :name="name" />
                    </button>
                  </div>
                </div>
                <div v-if="data.filesCreated?.length" p3 border="b base" flex="~ col gap-2 items-start">
                  <div op50 text-sm>
                    Created in:
                  </div>
                  <FileLink
                    v-for="file of data.filesCreated"
                    :key="file"
                    :filepath="file"
                    :cwd="payload.cwd"
                  />
                </div>
                <div v-if="data.filesCalled?.length" p3 flex="~ col gap-2 items-start">
                  <div op50 text-sm>
                    Used in:
                  </div>
                  <FileLink
                    v-for="file of data.filesCalled"
                    :key="file"
                    :filepath="file"
                    :cwd="payload.cwd"
                  />
                </div>
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
