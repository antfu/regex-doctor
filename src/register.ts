/* eslint-disable no-console */
import fs from 'node:fs'
import process from 'node:process'
import exitHook from 'exit-hook'
import { blue, green } from 'ansis'
import { RegexDoctor } from './doctor'

console.log(`[regex-doctor] start tracking`)

const doctor = new RegexDoctor()
const cwd = process.cwd()
doctor.start()

exitHook(() => {
  doctor.stop()
  fs.mkdirSync('./.regex-doctor', { recursive: true })
  fs.writeFileSync('./.regex-doctor/output.json', JSON.stringify(doctor.dump({
    cwd,
  }), null, 2))
  console.log(`[regex-doctor] output saved to ${blue`./.regex-doctor/output.json`}, run ${green.bold`npx regex-doctor view`} to view it in an interactive UI.`)
})
