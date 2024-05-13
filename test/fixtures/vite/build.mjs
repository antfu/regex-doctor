import fs from 'node:fs/promises'
import process from 'node:process'
import { build } from 'vite'
import { startRegexDoctor } from 'regex-doctor'

{
  const doctor = startRegexDoctor()

  await build()

  await fs.writeFile(
    'regex-doctor.json',
    JSON.stringify(doctor.dump({
      stacktrace: true,
      cwd: process.cwd(),
    }), null, 2),
    'utf-8',
  )
}
