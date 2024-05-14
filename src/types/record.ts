import type { RegexCallsDurations } from './data'

export interface RecordRegexCall {
  duration: number
  inputLength: number
  input?: string
  stack?: string
}

export interface RecordRegexInfo {
  regex: RegExp
  calls: RecordRegexCall[]
  /**
   * Path where the regex was created
   * Read from `trace-record`
   */
  filepath?: string
  dynamic?: boolean
}

export interface MergedRecordRegexInfo {
  regex: RegExp
  dynamic?: boolean
  calls: RecordRegexCall[]
  copies: number
  durations: RegexCallsDurations
  filesCreated: string[]
}
