import type { StackFrame } from 'error-stack-parser-es'

export interface RegExpObjectRepresentation {
  pattern: string
  flags: string
}

export interface SerializedRegExpInfo {
  regex: RegExpObjectRepresentation
  calls: SerializedRegExpCall[]
}

export interface SerializedRegExpCall {
  duration: number
  stringLength: number
  string?: string
  trace?: StackFrame[]
}

export interface RegExpCall {
  duration: number
  stringLength: number
  string?: string
  traceObj?: Error
}

export interface RegExpInfo {
  regex: RegExp
  calls: RegExpCall[]
}

export interface RegexDoctorOptions {
}
