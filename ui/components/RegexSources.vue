<script setup lang="ts">
import type { RegexDoctorResult, RegexInfo } from '../../src/types'

defineProps<{
  info: RegexInfo
  payload: RegexDoctorResult
}>()

const emit = defineEmits<{
  (event: 'select-package', packageName: string): void
}>()
</script>

<template>
  <div v-if="info.packages?.length" px4 py2 border="b base" flex="~ col gap-1 items-start">
    <div op50 text-sm>
      Packages
    </div>
    <div flex="inline gap-2 wrap">
      <button v-for="name in info.packages" :key="name" @click="emit('select-package', name)">
        <PackageNameDisplay :name="name" />
      </button>
    </div>
  </div>
  <div v-if="info.filesCreated?.length" px4 py2 border="b base" flex="~ col gap-2 items-start">
    <div op50 text-sm>
      Created in
    </div>
    <FileLink
      v-for="file of info.filesCreated"
      :key="file"
      :filepath="file"
      :cwd="payload.cwd"
    />
  </div>
  <div v-if="info.filesCalled?.length" px4 py2 flex="~ col gap-2 items-start">
    <div op50 text-sm>
      Used in
    </div>
    <FileLink
      v-for="file of info.filesCalled"
      :key="file"
      :filepath="file"
      :cwd="payload.cwd"
    />
  </div>
</template>
