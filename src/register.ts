/* eslint-disable no-console */
import { asyncExitHook } from 'exit-hook'
import c from 'picocolors'
import { RegexDoctor } from './doctor'

console.log(`[regex-doctor] start tracking`)

const doctor = new RegexDoctor()
doctor.start()

asyncExitHook(async () => {
  doctor.stop()
  await doctor.dump()
  console.log(`[regex-doctor] output saved to ${c.blue(await RegexDoctor.getFilePath())}, run ${c.green(c.bold('npx regex-doctor view'))} to view it in an interactive UI.`)
}, {
  wait: 10000,
})
