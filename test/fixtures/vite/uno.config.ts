import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'
import { record } from 'trace-record'

export default defineConfig({
  rules: [
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
    [record(/[\\:]?[\s'"`;{}]+text?-r+ed/), () => ({ color: 'red' })],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
})
