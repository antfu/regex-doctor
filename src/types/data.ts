import type { StackFrameLite } from 'error-stack-parser-es/lite'
import type { RecordRegexCall } from './record'

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
  pattern: string
  /**
   * Flags of the regex
   */
  flags: string
  /**
   * Is dynamic regex
   */
  dynamic?: boolean

  /**
   * Notable call infos
   */
  callsInfos: RegexCall[]
  /**
   * Array of stack traces
   */
  traces: StackFrameLite[][]
  /**
   * Summary of the time costed by the regex
   */
  sum: number
  /**
   * Min duration
   */
  min: number
  /**
   * Max duration
   */
  max: number

  /**
   * Total number of calls
   */
  calls: number
  /**
   * Total number of matches
   */
  matches: number
  /**
   * Match rate
   */
  copies: number

  /**
   * Files where the regex was created
   */
  filesCreated: string[]
  /**
   * Files where the regex was called
   */
  filesCalled: string[]
  /**
   * Package names where the regex was called or created
   */
  packages: string[]

  /**
   * Average of call duration
   */
  avg: number
  /**
   * Percentage of matches
   */
  matchRate: number
}

export interface RegexCall extends Pick<RecordRegexCall, 'duration' | 'inputLength' | 'matched' | 'matchLength' | 'index' | 'groups'> {
  /**
   * Input string, number stands for the truncated length
   */
  input?: (number | { text: string, matched?: boolean })[]
  /**
   * Index of the stack trace map
   */
  trace?: number
}
