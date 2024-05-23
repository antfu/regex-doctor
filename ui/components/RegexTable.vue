<script setup lang="ts">
import type { RegexDoctorResult, RegexInfo } from 'regex-doctor'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { Dropdown } from 'floating-vue'
import Dialog from 'primevue/dialog'

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
const visible = ref(false)
function showCurrentRegex(info: RegexInfo) {
  currentRegex.value = info
  visible.value = true
}
</script>

<template>
  <DataTable class="regex-table" :value="filtered" scrollable scroll-height="flex" :virtual-scroller-options="{ itemSize: 36 }" :default-sort-order="-1" data-key="no" table-class="w-full text-right data-table">
    <Column field="dynamic" header="Dynamic" header-class="pl4">
      <template #body="{ data }">
        <PackageNameDisplay v-if="data.dynamic" name="new" />
      </template>
    </Column>
    <Column field="regex" header="Regex" class="text-left" header-class="pl4 [&>*]:justify-start">
      <template #body="{ data }">
        <button flex h-full px2 my1 border="~ base rounded" bg-gray:2 @click="showCurrentRegex(data)">
          <ShikiInline
            :code="`/${data.pattern}/${data.flags}`"
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
    <Column field="groups" header="Groups" sortable>
      <template #body="{ data }">
        <NumberDisplay :number="data.groups" colorful="small" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="sum" header="Total" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.sum" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="avg" header="Avg" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.avg" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="max" header="Max" sortable>
      <template #body="{ data }">
        <button @click="showCurrentRegex(data)">
          <DurationDisplay :ms="data.max" />
        </button>
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="min" header="Min" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.min" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>
    <Column field="dpk" header="DPK" sortable>
      <template #body="{ data }">
        <DurationDisplay :ms="data.dpk" />
      </template>
      <template #sorticon="{ sorted, sortOrder }">
        <SortIcon :sorted="sorted" :sort-order="sortOrder" />
      </template>
    </Column>

    <Column field="filesCalled.length" header="Used in" sortable header-class="pr-7!">
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
              <div text-sm text-left>
                <RegexSources
                  :info="data"
                  :payload="payload"
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
  <Dialog
    v-model:visible="visible" :show-header="false"
    maximizable modal dismissable-mask
    :pt="{
      mask: {
        style: 'backdrop-filter: blur(5px)',
      },
    }"
  >
    <div v-if="currentRegex" bg-base shadow ma w-90vw h-90vh border="~ base rounded" of-hidden>
      <RegexDetail :info="currentRegex" :payload="payload" />
    </div>
  </Dialog>
</template>

<style>
.regex-table,
.regex-table .p-datatable-wrapper {
  --uno: h-full;
}
.p-virtualscroller {
  position: relative;
  overflow: auto;
  contain: strict;
  transform: translateZ(0);
  will-change: scroll-position;
  outline: 0 none;
}
.p-datatable-scrollable-table > .p-datatable-thead {
  --uno: top-0 z-1 bg-gray/2 backdrop-blur-md;
}
</style>
