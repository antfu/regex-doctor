import type { StackFrameLite } from 'error-stack-parser-es/lite'
import type { RecordRegexCall } from './record'

export interface RegexCallsDurations {
  count: number
  sum: number
  avg: number
  min: number
  max: number
}

export interface RegexObjectRepresentation {
  pattern: string
  flags: string
}

export interface RegexDoctorResult {
  /**
   * The number of regexes instances tracked
   */
  count: number
  /**
   * The number of unique regexes tracked
   */
  countUnique: number
  /**
   * Total time spent in executing regexes
   */
  totalExecution: number
  /**
   * Total time spent in all regexes
   */
  totalDuration: number
  /**
   * Details of each regex
   */
  regexInfos: RegexInfo[]
  /**
   * Working directory
   */
  cwd?: string
  /**
   * CLI arguments
   */
  argv?: string[]
}

export interface RegexInfo {
  /**
   * Unique id
   */
  no: number
  /**
   * Serialized regex object
   */
  regex: RegexObjectRepresentation
  /**
   * Number of copies of the the exact same regex has been created
   */
  copies: number
  /**
   * Notable call infos
   */
  callsInfos: RegexCall[]
  /**
   * Array of stack traces
   */
  traces?: (StackFrameLite[])[]
  /**
   * Number of calls
   */
  calls: number
  /**
   * Durations of all calls
   */
  durations: RegexCallsDurations
  /**
   * Files where the regex was created
   */
  filesCreated?: string[]
  /**
   * Files where the regex was called
   */
  filesCalled?: string[]
  /**
   * Package names where the regex was called or created
   */
  packages?: string[]
  /**
   * Is dynamic regex
   */
  dynamic?: boolean
}

export interface RegexCall extends Pick<RecordRegexCall, 'duration' | 'inputLength' | 'matched' | 'index' | 'groups'> {
  /**
   * Input string, number stands for the truncated length
   */
  input?: (number | string)[]
  /**
   * Index of the stack trace map
   */
  trace?: number
}
