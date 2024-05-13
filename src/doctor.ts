import type { RegexDoctorResult } from './types/data'
import type { RecordRegexInfo } from './types/record'
import type { RegexDoctorDumpOptions, RegexDoctorOptions } from './types/options'
import { hijack, listeners, restore } from './hijack'
import { dump } from './dump'

export class RegexDoctor {
  map = new Map<RegExp, RecordRegexInfo>()

  constructor(
    public options: RegexDoctorOptions = {},
  ) { }

  stop() {
    listeners.delete(this)
    if (!listeners.size)
      restore()
  }

  start() {
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

  dump(options: RegexDoctorDumpOptions = {}): RegexDoctorResult {
    return dump(this.map, options)
  }
}
