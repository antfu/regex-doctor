<script setup lang="ts">
import type { RegexDoctorResult } from 'regex-doctor'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { Dropdown } from 'floating-vue'

defineProps<{
  payload: RegexDoctorResult
}>()
</script>

<template>
  <DataTable :value="payload.regexInfos" table-class="w-full text-right data-table">
    <Column field="regex" header="Regex" class="text-left" header-class="pl4 [&>*]:justify-start">
      <template #body="{ data }">
        <Dropdown>
          <div flex h-full pl4>
            <ShikiInline
              :code="`/${data.regex.pattern}/${data.regex.flags}`"
              lang="js" text-gray:50
              of-hidden max-w-150 text-ellipsis ws-nowrap mya
            />
          </div>
          <template #popper>
            <div p2>
              <ShikiInline
                :code="`/${data.regex.pattern}/${data.regex.flags}`"
                lang="js"
                max-w-90vw
              />
            </div>
          </template>
        </Dropdown>
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
        <DurationDisplay :ms="data.durations.max" />
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
        <Dropdown>
          <button pr-4 font-mono w-full flex="~ gap-1 items-center justify-end">
            <div
              v-if="data.filesCreated?.length" i-ph-file-code-duotone text-purple
              title="Regex creation source"
            />
            <div op50 :class="data.filesCalled?.length === 1 ? 'i-ph-file-text-duotone' : 'i-ph-files-duotone'" />
            {{ data.filesCalled?.length }}
          </button>
          <template #popper>
            <div py2 px3 flex="~ col gap-1 items-start" text-sm>
              <template v-if="data.filesCreated?.length">
                <div op50 text-sm>
                  Created in:
                </div>
                <FileLink
                  v-for="file of data.filesCreated"
                  :key="file"
                  :filepath="file"
                  :cwd="payload.cwd"
                />
              </template>
              <template v-if="data.filesCalled?.length">
                <div op50 text-sm>
                  Used in:
                </div>
                <FileLink
                  v-for="file of data.filesCalled"
                  :key="file"
                  :filepath="file"
                  :cwd="payload.cwd"
                />
              </template>
            </div>
          </template>
        </Dropdown>
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
  </DataTable>
</template>
