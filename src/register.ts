/* eslint-disable no-console */
import process from 'node:process'
import { asyncExitHook } from 'exit-hook'
import c from 'picocolors'
import { RegexDoctor } from './doctor'

console.log(`[regex-doctor] start tracking`)

const doctor = new RegexDoctor()
doctor.start()

asyncExitHook(async () => {
  try {
    console.log(`\n[regex-doctor] stop track`)
    doctor.stop()
    const filePath = await doctor.dump()
    console.log(`[regex-doctor] output saved to ${c.blue(filePath)}, run ${c.green(c.bold('npx regex-doctor view'))} to view it in an interactive UI.`)
  }
  catch (error) {
    console.error(c.red('Error during async exit hook:'), error)
  }
}, {
  wait: 20 * 60 * 1000, // dump and save json very time-consuming
})

process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`)
})
