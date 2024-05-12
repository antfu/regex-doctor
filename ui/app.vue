<script setup lang="ts">
useHead({
  title: 'RegexDoctor',
})
</script>

<template>
  <NuxtPage />
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}

html.dark {
  color-scheme: dark;
}

html.dark .shiki,
html.dark .shiki span {
  background: var(--shiki-dark-bg) !important;
  color: var(--shiki-dark) !important;
}
</style>
