import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pack, unpack } from 'msgpackr'
import type { RegexDoctorResult } from './types/data'
import type { RecordRegexInfo } from './types/record'
import type { RegexDoctorDumpOptions, RegexDoctorOptions } from './types/options'
import { hijack, listeners, restore } from './hijack'
import { dump } from './dump'

// TODO: read file path from regex-doctor config file
const defaultFileData = {
  cwd: '.',
  folder: '.regex-doctor',
  file: 'output.bin',
}

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

  static get filePath() {
    return path.join(defaultFileData.cwd, defaultFileData.folder, defaultFileData.file)
  }

  dump(options: RegexDoctorDumpOptions = {}) {
    this.saveDuration()
    mkdirSync(path.join(defaultFileData.cwd, defaultFileData.folder), { recursive: true })
    defaultFileData.cwd = options.cwd || defaultFileData.cwd
    defaultFileData.folder = options.folder || defaultFileData.folder
    defaultFileData.file = options.file || defaultFileData.file
    writeFileSync(RegexDoctor.filePath, pack(dump(this, options)))
  }

  static pickup(filePath?: string): RegexDoctorResult {
    return unpack(readFileSync(filePath || RegexDoctor.filePath))
  }
}
