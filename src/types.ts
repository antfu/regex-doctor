import type { StackFrame } from 'error-stack-parser-es'

export interface RegExpObjectRepresentation {
  pattern: string
  flags: string
}

export interface SerializedRegexDoctorResult {
  /**
   * The number of regexes instances tracked
   */
  count: number
  /**
   * The number of unique regexes tracked
   */
  countUnique: number
  /**
   * Total time spent in all regexes
   */
  totalDuration: number
  regexes: SerializedRegExpInfo[]
}

export interface SerializedRegExpInfo {
  /**
   * Serialized regex object
   */
  regex: RegExpObjectRepresentation
  /**
   * Notable call infos
   */
  callsInfos: SerializedRegExpCall[]
  /**
   * Number of calls
   */
  calls: number
  /**
   * Durations of all calls
   */
  durations: Durations
  /**
   * Files where the regex was called
   */
  files?: string[]
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

export interface Durations {
  count: number
  sum: number
  avg: number
  min: number
  max: number
}

export interface RegExpInfo {
  regex: RegExp
  calls: RegExpCall[]
  durations?: Durations
}

export interface RegexDoctorOptions {
}

export interface RegexDoctorDumpOptions {
  /**
   * Limit of the numbers of regexes to dump
   * Sorted by the total duration of all calls
   *
   * @default 50
   */
  limitRegexes?: number

  /**
   * Limit of the numbers of calls to dump
   * @default 5
   */
  limitCalls?: number

  /**
   * Include stack traces in the dump
   */
  stacktrace?: boolean
}
