import fs from 'node:fs/promises'

export default defineEventHandler(async () => {
  return JSON.parse(await fs.readFile(
    new URL('../../../regex-doctor.json', import.meta.url),
    'utf-8',
  ))
})
