import PrimeVueStyled from 'primevue/config'

export default defineNuxtPlugin({
  setup({ vueApp: app }) {
    app.use(PrimeVueStyled)
  },
})
