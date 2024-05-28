import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pack, unpack } from 'msgpackr'
import type { RegexDoctorResult } from './types/data'
import type { RecordRegexInfo } from './types/record'
import type { RegexDoctorDumpOptions, RegexDoctorOptions } from './types/options'
import { hijack, listeners, restore } from './hijack'
import { dump } from './dump'
import { loadRegexDoctorConfig } from './config'

export class RegexDoctor {
  map = new Map<RegExp, RecordRegexInfo>()

  duration = 0
  timeStart: number | undefined

  constructor(
    public options: RegexDoctorOptions = {},
  ) { }

  private saveDuration(start: boolean = !!this.timeStart) {
    if (this.timeStart) {
      this.duration += performance.now() - this.timeStart
      this.timeStart = undefined
    }
    if (start)
      this.timeStart = performance.now()
  }

  stop() {
    this.saveDuration(false)
    listeners.delete(this)
    if (!listeners.size)
      restore()
  }

  start() {
    this.saveDuration(true)
    hijack()
    listeners.add(this)

    /**
     * You can also use the `using` syntax to auto dispose the instance
     *
     * @see https://github.com/tc39/proposal-explicit-resource-management
     * @example
     * ```ts
     * {
     *   using _ = doctor.start()
     *   // Your code here
     * }
     * ```
     */
    return {
      [Symbol.dispose]: () => {
        this.stop()
      },
    }
  }

  /**
   * Allow auto dispose the instance
   */
  [Symbol.dispose]() {
    this.dispose()
  }

  dispose() {
    this.stop()
    this.clear()
  }

  async run(fn: Function) {
    this.start()
    try {
      return await fn()
    }
    finally {
      this.stop()
    }
  }

  clear() {
    this.map.clear()
  }

  static async getFilePath() {
    const config = await loadRegexDoctorConfig()
    return path.join(config.rootDir, config.outputDir, config.outputFileName)
  }

  async dump(options: RegexDoctorDumpOptions = {}) {
    this.saveDuration()
    const config = await loadRegexDoctorConfig()
    mkdirSync(path.join(config.rootDir, config.outputDir), { recursive: true })
    writeFileSync(await RegexDoctor.getFilePath(), pack(dump(this, options)))
  }

  static async pickup(filePath?: string): Promise<RegexDoctorResult> {
    return unpack(readFileSync(filePath || (await RegexDoctor.getFilePath())))
  }
}
