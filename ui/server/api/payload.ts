import fs from 'node:fs/promises'
import type { RegexDoctorResult } from '../../../src/types/data'

export default defineEventHandler(async () => {
  return JSON.parse(await fs.readFile(
    // TODO: read the path from CLI
    new URL('../../.regex-doctor/output.json', import.meta.url),
    'utf-8',
  )) as RegexDoctorResult
})
