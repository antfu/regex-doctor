import { parseStack } from 'error-stack-parser-es/lite'
import { getTrace } from 'trace-record'
import type { MergedRecordRegexInfo, RecordRegexInfo, RegexCallsDurations, RegexDoctorDumpFiltersOptions, RegexDoctorDumpOptions, RegexInfo } from './types'
import { extractPackagePath, normalizeFilepath } from './shared/path'

const defaultFilters: Required<RegexDoctorDumpFiltersOptions> = {
  top: 20,
  minCalls: 1000,
  minCopies: 50,
  minDurationSum: 0.3,
  minDurationAvg: 0.1,
  minDurationMax: 0.2,
}

export function dump(
  map: Map<RegExp, RecordRegexInfo>,
  options: RegexDoctorDumpOptions = {},
) {
  const {
    limitCalls = 5,
    // stacktrace = true,
  } = options

  const filters = {
    ...options.filters,
    ...defaultFilters,
  }

  let totalDuration = 0
  const uniqueMap = new Map<string, MergedRecordRegexInfo>()

  Array.from(map.values())
    .forEach((info) => {
      const key = `${info.regex.source}--${info.regex.flags}`
      const merged = uniqueMap.get(key) || {
        regex: info.regex,
        calls: [],
        copies: 0,
        durations: undefined!,
        filesCreated: [],
      }

      if (!info.filepath) {
        const trace = getTrace(info.regex)
          ?.find(frame => frame.file && !frame.file.startsWith('node:'))
        if (trace)
          info.filepath = `${normalizeFilepath(trace.file!)}:${trace.line!}:${trace.col!}`
      }

      merged.calls.push(...info.calls)
      merged.copies++

      uniqueMap.set(key, merged)

      if (info.filepath)
        merged.filesCreated.push(info.filepath)
    })

  let infos = Array.from(uniqueMap.values())
  infos.forEach((info) => {
    info.durations = getDurations(info)
    totalDuration += info.durations.sum
  })
  infos.sort((a, b) => b.durations!.sum - a.durations!.sum)

  infos = infos.filter((info, idx) => {
    if (idx < filters.top)
      return true
    if (info.calls.length >= filters.minCalls)
      return true
    if (info.copies >= filters.minCopies)
      return true
    if (info.durations.sum >= filters.minDurationSum)
      return true
    if (info.durations.avg >= filters.minDurationAvg)
      return true
    if (info.durations.max >= filters.minDurationMax)
      return true
    return false
  })

  function dumpInfo(info: MergedRecordRegexInfo, idx: number): RegexInfo {
    const calls = info.calls
      .sort((a, b) => b.duration - a.duration)

    const files = new Set<string>()

    let infos = calls.map((call) => {
      // TODO: group by unique stacks
      const trace = call.stack
        ? parseStack(call.stack, { slice: [1, 10] }).filter(frame => frame.file)
        : undefined

      if (trace && trace[0])
        files.add(`${normalizeFilepath(trace[0].file!)}:${trace[0].line!}:${trace[0].col!}`)

      return {
        duration: call.duration,
        inputLength: call.inputLength,
        trace,
      }
    })

    // TODO: Filter if above average by 2x or something
    if (limitCalls > 0)
      infos = infos.slice(0, limitCalls)

    const filesCalled = Array.from(files)

    const packages = new Set<string>()
    for (const file of [...filesCalled, ...info.filesCreated]) {
      const r = extractPackagePath(file)
      if (r.package)
        packages.add(r.package)
    }

    return {
      no: idx,
      regex: {
        pattern: info.regex.source,
        flags: info.regex.flags,
      },
      copies: info.copies,
      calls: info.calls.length,
      callsInfos: infos,
      durations: info.durations || getDurations(info),
      filesCalled,
      filesCreated: info.filesCreated,
      packages: Array.from(packages),
    }
  }

  return {
    count: map.size,
    countUnique: uniqueMap.size,
    totalDuration,
    regexInfos: infos.map((info, idx) => dumpInfo(info, idx)),
    cwd: options.cwd,
  }
}

function getDurations(info: RecordRegexInfo): RegexCallsDurations {
  let sum = 0
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  info.calls
    .forEach((call) => {
      sum += call.duration
      min = Math.min(min, call.duration)
      max = Math.max(max, call.duration)
    })

  return {
    count: info.calls.length,
    sum,
    avg: sum / info.calls.length,
    min,
    max,
  }
}
