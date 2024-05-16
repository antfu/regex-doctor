export interface RecordRegexCall {
  duration: number
  /**
   * Duration per 1,000 characters
   */
  dpk: number
  inputLength: number
  input?: string
  stack?: string
  matched?: boolean
  matchLength?: number
  index?: number
  groups?: number
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
