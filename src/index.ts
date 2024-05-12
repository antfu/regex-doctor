/* eslint-disable no-extend-native */
import { parse } from 'error-stack-parser-es'
import type { Durations, RegExpInfo, RegexDoctorDumpOptions, RegexDoctorOptions, SerializedRegExpInfo, SerializedRegexDoctorResult } from './types'

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
          traceObj: duration > 0.001
            // eslint-disable-next-line unicorn/error-message
            ? new Error()
            : undefined,
          duration,
          // string,
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

  dump(options: RegexDoctorDumpOptions = {}): SerializedRegexDoctorResult {
    const {
      limitRegexes = 50,
      limitCalls = 5,
      stacktrace = false,
    } = options

    const unique = new Set<string>()
    let totalDuration = 0
    let items = Array.from(this.map.values())
    items.forEach((info) => {
      info.durations = getDurations(info)
      totalDuration += info.durations.sum
      unique.add(info.regex.source)
    })
    items.sort((a, b) => b.durations!.sum - a.durations!.sum)

    if (limitRegexes > 0)
      items = items.slice(0, limitRegexes)

    function dumpInfo(info: RegExpInfo): SerializedRegExpInfo {
      const calls = info.calls
        .sort((a, b) => b.duration - a.duration)

      if (limitCalls > 0)
        calls.splice(limitCalls)

      const files = new Set<string>()

      const infos = calls.map((call) => {
        const trace = stacktrace && call.traceObj
          ? parse(call.traceObj)
            .slice(1)
            .filter(frame => frame.fileName && !frame.fileName.startsWith('node:'))
            .map((frame) => {
              delete frame.source
              return frame
            })
          : undefined

        if (trace && trace[0])
          files.add(`${trace[0].fileName!}:${trace[0].lineNumber!}:${trace[0].columnNumber!}`)

        return {
          duration: call.duration,
          stringLength: call.stringLength,
          trace,
        }
      })

      return {
        regex: {
          pattern: info.regex.source,
          flags: info.regex.flags,
        },
        calls: info.calls.length,
        callsInfos: infos,
        durations: info.durations || getDurations(info),
        files: Array.from(files),
      }
    }

    return {
      count: this.map.size,
      countUnique: unique.size,
      totalDuration,
      regexes: items.map(info => dumpInfo(info)),
    }
  }
}

function getDurations(info: RegExpInfo): Durations {
  let sum = 0
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  info.calls
    .forEach((call) => {
      sum += call.duration
      min = Math.min(min, call.duration)
      max = Math.max(max, call.duration)
    })

  return {
    count: info.calls.length,
    sum,
    avg: sum / info.calls.length,
    min,
    max,
  }
}

export function startRegexDoctor() {
  const doctor = new RegexDoctor()
  doctor.start()
  return doctor
}
