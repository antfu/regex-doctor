/* eslint-disable unicorn/error-message */
/* eslint-disable no-extend-native */

import type { RecordRegexCall } from './types'
import type { RegexDoctor } from './doctor'

export const listeners = new Set<RegexDoctor>()
let hijacked = false

function noop() {}

let _restore = noop

export function restore() {
  _restore()
}

export function hijack() {
  if (hijacked)
    return
  // To avoid infinite recursion
  let isTracing = true
  const _exec = RegExp.prototype.exec
  RegExp.prototype.exec = function (string) {
    if (!listeners.size || !isTracing)
      return _exec.call(this, string)

    isTracing = false
    try {
      const start = performance.now()
      const result = _exec.call(this, string)
      const end = performance.now()
      const duration = end - start
      const call: RecordRegexCall = Object.freeze({
        traceObj: duration > 0.001
          ? new Error()
          : undefined,
        duration,
        input: string,
        inputLength: string.length,
      })

      for (const listener of listeners) {
        const map = listener.map
        if (!map.has(this)) {
          map.set(this, {
            regex: this,
            calls: [],
          })
        }
        const info = map.get(this)!
        info.calls.push(call)
      }

      return result
    }
    finally {
      isTracing = true
    }
  }

  _restore = function () {
    RegExp.prototype.exec = _exec
    hijacked = false
    _restore = noop
  }
}
