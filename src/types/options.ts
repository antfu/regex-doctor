export interface RegexDoctorOptions {
}

export interface RegexDoctorDumpOptions {

  /**
   * Limit of the numbers of calls to dump. Sorted by duration cost.
   * @default 10
   */
  limitCalls?: number

  /**
   * Maximum length of the input to dump
   *
   * @default 500
   */
  limitInputLength?: number

  /**
   * Filters for regex details. Include if one of the requirements is met.
   */
  filters?: RegexDoctorDumpFiltersOptions

  /**
   * Include stack traces in the dump
   */
  stacktrace?: boolean
}

export interface RegexDoctorDumpFiltersOptions {
  /**
   * Filter the amount of top costly regexes to show
   *
   * @default 20
   */
  top?: number

  /**
   * Filter regexes by times of calls
   *
   * @default 1000
   */
  minCalls?: number

  /**
   * Filter regexes by copies
   *
   * @default 50
   */
  minCopies?: number

  /**
   * Filter regexes by total duration sum, in milliseconds
   * @default 0.3
   */
  minDurationSum?: number

  /**
   * Filter regexes by average duration, in milliseconds
   * @default 0.1
   */
  minDurationAvg?: number

  /**
   * Filter regexes by maximum duration, in milliseconds
   *
   * @default 0.2
   */
  minDurationMax?: number

  /**
   * Maximum amount of regexes details. Guarded for record memory usage.
   *
   * @default 300
   */
  maximumAmount?: number
}
