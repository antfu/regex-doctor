#!/usr/bin/env zx

/* eslint-disable no-console */
import { RegexDoctor } from 'regex-doctor'
import c from 'picocolors'

console.log(`[regex-doctor] start tracking`)

const doctor = new RegexDoctor()
doctor.start()

await $`node ./node_modules/nuxi/bin/nuxi.mjs build`

doctor.stop()

await doctor.dump()
console.log(`[regex-doctor] output saved to ${c.blue(await RegexDoctor.getFilePath())}, run ${c.green(c.bold('npx regex-doctor view'))} to view it in an interactive UI.`)
