import { fileURLToPath } from 'node:url'

export const uiDistDir = fileURLToPath(new URL('../dist/ui/public', import.meta.url))
