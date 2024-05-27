/* eslint-disable no-console */
import process from 'node:process'
import exitHook from 'exit-hook'
import c from 'picocolors'
import { RegexDoctor } from './doctor'

console.log(`[regex-doctor] start tracking`)

const doctor = new RegexDoctor()
const cwd = process.cwd()
doctor.start()

exitHook(() => {
  doctor.stop()
  doctor.dump({ cwd })
  console.log(`[regex-doctor] output saved to ${c.blue(RegexDoctor.filePath)}, run ${c.green(c.bold('npx regex-doctor view'))} to view it in an interactive UI.`)
})
