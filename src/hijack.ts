/* eslint-disable unicorn/error-message */

import { record } from 'trace-record'
import type { RecordRegexCall } from './types'
import type { RegexDoctor } from './doctor'

export const listeners = new Set<RegexDoctor>()
let hijacked = false

function noop() { }

let _restore = noop

export function restore() {
  _restore()
}

const RegExp = globalThis.RegExp

const MyRegExp = function (pattern: string | RegExp, flags?: string) {
  const regex = RegExp(pattern, flags)
  record(regex, { level: 2 })

  for (const listener of listeners) {
    listener.map.set(regex, {
      regex,
      calls: [],
      dynamic: true,
    })
  }
  return regex
}
MyRegExp.prototype = RegExp.prototype

export function hijack() {
  if (hijacked)
    return
  // To avoid infinite recursion
  let isTracing = true
  const _exec = RegExp.prototype.exec
  function myExec(this: RegExp, s: string) {
    if (!listeners.size || !isTracing)
      return _exec.call(this, s)

    isTracing = false
    try {
      const start = performance.now()
      const result = _exec.call(this, s)
      const end = performance.now()
      const duration = end - start
      const inputLength = s.length
      const call: RecordRegexCall = {
        stack: duration > 0.001
          ? new Error().stack
          : undefined,
        duration,
        dpk: duration * 1000 / inputLength,
        input: s,
        inputLength,
      }

      if (result) {
        call.matched = true
        call.index = result.index
        call.groups = result.length - 1
        call.matchLength = result[0].length
      }

      Object.freeze(call)

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

  RegExp.prototype.exec = myExec;

  // @ts-expect-error  @see:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto
  // eslint-disable-next-line no-proto, no-restricted-properties
  /\./.__proto__.exec = myExec

  // @ts-expect-error - hijacking
  globalThis.RegExp = MyRegExp

  _restore = function () {
    globalThis.RegExp = RegExp
    RegExp.prototype.exec = _exec
    hijacked = false
    _restore = noop
  }
}
