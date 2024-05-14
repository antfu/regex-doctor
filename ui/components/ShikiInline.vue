<script lang="ts">
import type { HighlighterCore } from 'shiki/core'
import { getHighlighterCore } from 'shiki/core'

const shiki = ref<HighlighterCore>()

const cache = new Map<string, string>()

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
  if (cache.has(props.code))
    return cache.get(props.code)!

  if (!shiki.value)
    return ''

  const code = shiki.value.codeToHtml(props.code, {
    lang: props.lang,
    themes: {
      dark: 'vitesse-dark',
      light: 'vitesse-light',
    },
    defaultColor: false,
    structure: 'inline',
  })

  cache.set(props.code, code)
  return code
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
