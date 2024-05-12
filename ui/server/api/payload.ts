import fs from 'node:fs/promises'
import type { SerializedRegexDoctorResult } from '../../../src/types'

export default defineEventHandler(async () => {
  return JSON.parse(await fs.readFile(
    new URL('../../../fixture/regex-doctor.json', import.meta.url),
    'utf-8',
  )) as SerializedRegexDoctorResult
})
