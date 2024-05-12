import fs from 'node:fs/promises'
import { build } from 'vite'
// eslint-disable-next-line antfu/no-import-dist
import { startRegexDoctor } from '../dist/index.mjs'

{
  const doctor = startRegexDoctor()

  await build()

  await fs.writeFile(
    'regex-doctor.json',
    JSON.stringify(doctor.dump({
      stacktrace: true,
    }), null, 2),
    'utf-8',
  )
}
