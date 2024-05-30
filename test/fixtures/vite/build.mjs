import { build } from 'vite'
import { startRegexDoctor } from 'regex-doctor'

{
  const doctor = startRegexDoctor()

  await build()

  await doctor.dump({
    stacktrace: true,
  })
}
