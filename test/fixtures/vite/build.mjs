import process from 'node:process'
import { build } from 'vite'
import { startRegexDoctor } from 'regex-doctor'

{
  const doctor = startRegexDoctor()

  await build()

  doctor.dump({
    stacktrace: true,
    cwd: process.cwd(),
  })
}
