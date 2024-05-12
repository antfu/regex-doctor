import fs from 'node:fs/promises'
import { startRegexDoctor } from '../src'

{
  using doctor = startRegexDoctor()

  await import('./foo')

  // doctor.stop()
  // const regex = /this should not be included/
  // const result = regex.exec('play(123)')

  await fs.writeFile(
    'regex-doctor.json',
    JSON.stringify(doctor.dump(), null, 2),
    'utf-8',
  )
}
