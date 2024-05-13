<script lang="ts">
import type { HighlighterCore } from 'shiki/core'
import { getHighlighterCore } from 'shiki/core'

const shiki = ref<HighlighterCore>()

getHighlighterCore({
  themes: [
    import('shiki/themes/vitesse-dark.mjs'),
    import('shiki/themes/vitesse-light.mjs'),
  ],
  langs: [
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/typescript.mjs'),
  ],
  loadWasm: import('shiki/wasm'),
})
  .then((core) => {
    shiki.value = core
  })
</script>

<script setup lang="ts">
const props = defineProps<{
  code: string
  lang: string
  inline?: boolean
}>()

const highlighted = computed(() => {
  if (!shiki.value)
    return ''
  return shiki.value.codeToHtml(props.code, {
    lang: props.lang,
    themes: {
      dark: 'vitesse-dark',
      light: 'vitesse-light',
    },
    defaultColor: false,
    structure: 'inline',
  })
})
</script>

<template>
  <code
    v-if="!shiki"
    class="shiki inline-block"
  >
    {{ code }}
  </code>
  <code
    v-else
    class="shiki inline-block"
    v-html="highlighted"
  />
</template>
