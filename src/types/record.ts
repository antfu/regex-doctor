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
}

export interface MergedRecordRegexInfo {
  regex: RegExp
  calls: RecordRegexCall[]
  copies: number
  durations: RegexCallsDurations
  filesCreated: string[]
}
