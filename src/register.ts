import fs from 'node:fs'
import process from 'node:process'
import exitHook from 'exit-hook'
import { RegexDoctor } from './doctor'

const doctor = new RegexDoctor()
doctor.start()

const cwd = process.cwd()

exitHook(() => {
  doctor.stop()
  fs.mkdirSync('./.regex-doctor', { recursive: true })
  fs.writeFileSync('./.regex-doctor/output.json', JSON.stringify(doctor.dump({
    stacktrace: true,
    cwd,
  }), null, 2))
  // eslint-disable-next-line no-console
  console.log('[regex-doctor] output saved to ./.regex-doctor/output.json')
})
