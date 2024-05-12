/* eslint-disable no-extend-native */
import { parse } from 'error-stack-parser-es'
import type { RegExpInfo, RegexDoctorOptions, SerializedRegExpCall, SerializedRegExpInfo } from './types'

export * from './types'

export class RegexDoctor {
  map = new Map<RegExp, RegExpInfo>()

  constructor(
    public options: RegexDoctorOptions = {},
  ) {}

  stop() {
    // Implemention will be replaced by start
  }

  start() {
    this.stop()

    const map = this.map
    const _exec = RegExp.prototype.exec

    // To avoid infinite recursion
    let tracing = true
    RegExp.prototype.exec = function (string) {
      if (!tracing)
        return _exec.call(this, string)
      tracing = false
      try {
        if (!map.has(this)) {
          map.set(this, {
            regex: this,
            calls: [],
          })
        }

        const info = map.get(this)!
        const start = performance.now()
        const result = _exec.call(this, string)
        const end = performance.now()
        const duration = end - start

        info.calls.push({
          // eslint-disable-next-line unicorn/error-message
          traceObj: new Error(),
          duration,
          string,
          stringLength: string.length,
        })

        return result
      }
      finally {
        tracing = true
      }
    }

    this.stop = () => {
      RegExp.prototype.exec = _exec
      this.stop = () => {}
    }

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

  dump(): SerializedRegExpInfo[] {
    return Array.from(this.map.values())
      .map((info): SerializedRegExpInfo => {
        return {
          regex: {
            pattern: info.regex.source,
            flags: info.regex.flags,
          },
          calls: info.calls
            .map((call): SerializedRegExpCall => {
              return {
                ...call,
                trace: call.traceObj
                  ? parse(call.traceObj)
                    .slice(1)
                    .filter(frame => frame.fileName && !frame.fileName.startsWith('node:'))
                    .map((frame) => {
                      delete frame.source
                      return frame
                    })
                  : undefined,
              }
            }),
        }
      })
  }
}

export function startRegexDoctor() {
  const doctor = new RegexDoctor()
  doctor.start()
  return doctor
}
