import type { StackFrameLite } from 'error-stack-parser-es/lite'
import { parseStack } from 'error-stack-parser-es/lite'
import { getTrace } from 'trace-record'
import type { MergedRecordRegexInfo, RecordRegexInfo, RegexCall, RegexCallsDurations, RegexDoctorDumpFiltersOptions, RegexDoctorDumpOptions, RegexDoctorResult, RegexInfo } from './types'
import { extractPackagePath, normalizeFilepath } from './shared/path'
import type { RegexDoctor } from './doctor'

const defaultFilters: Required<RegexDoctorDumpFiltersOptions> = {
  top: 20,
  minCalls: 1000,
  minCopies: 50,
  minDurationSum: 0.3,
  minDurationAvg: 0.1,
  minDurationMax: 0.2,
}

export function dump(
  doctor: RegexDoctor,
  options: RegexDoctorDumpOptions = {},
): RegexDoctorResult {
  const map = doctor.map
  const {
    limitCalls = 5,
    limitInputLength = 500,
    // stacktrace = true,
  } = options

  const filters = {
    ...options.filters,
    ...defaultFilters,
  }

  let totalExecution = 0
  const uniqueMap = new Map<string, MergedRecordRegexInfo>()

  Array.from(map.values())
    .forEach((info) => {
      const key = `${info.regex.source}--${info.regex.flags}${info.dynamic ? '--dynamic' : ''}`
      const merged = uniqueMap.get(key) || {
        regex: info.regex,
        calls: [],
        copies: 0,
        durations: undefined!,
        filesCreated: [],
        dynamic: info.dynamic,
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
    totalExecution += info.durations.sum
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
    const traces = new Map<string, { idx: number, trace: StackFrameLite[] }>()

    let infos = calls.map((call): RegexCall => {
      let traceIdx: number | undefined
      if (call.stack) {
        if (traces.has(call.stack)) {
          traceIdx = traces.get(call.stack)!.idx
        }
        else {
          const trace = parseStacktrace(call.stack)
          if (trace && trace[0]) {
            files.add(`${normalizeFilepath(trace[0].file!)}:${trace[0].line!}:${trace[0].col!}`)
            traceIdx = traces.size
            traces.set(call.stack, { idx: traceIdx, trace })
          }
        }
      }

      let input: RegexCall['input']
      if (call.input != null) {
        input = []
        if (call.input.length <= limitInputLength) {
          input.push(call.input)
        }
        else if (call.index != null) {
          const index = Math.max(0, Math.round(call.index - limitInputLength * 0.3))
          if (index > 0)
            input.push(index)
          const snippet = call.input.slice(index, index + limitInputLength)
          input.push(snippet)
          const rest = call.inputLength - index - snippet.length
          if (rest > 0)
            input.push(rest)
        }
        else {
          const snippet = call.input.slice(0, limitInputLength)
          input.push(snippet)
          const rest = call.inputLength - snippet.length
          if (rest > 0)
            input.push(rest)
        }
      }
      return {
        duration: call.duration,
        inputLength: call.inputLength,
        input,
        trace: traceIdx,
        matched: call.matched,
        index: call.index,
        groups: call.groups,
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
      traces: Array.from(traces.values())
        .sort((a, b) => a.idx - b.idx)
        .map(({ trace }) => trace),
      durations: info.durations || getDurations(info),
      filesCalled,
      filesCreated: info.filesCreated,
      dynamic: info.dynamic,
      packages: Array.from(packages),
    }
  }

  return {
    count: map.size,
    countUnique: uniqueMap.size,
    totalDuration: doctor.duration,
    totalExecution,
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

const traceCache: Map<string, StackFrameLite[] | undefined> = new Map()

function parseStacktrace(string?: string) {
  if (!string)
    return
  if (traceCache.has(string))
    return traceCache.get(string)
  const trace = string
    ? parseStack(string, { slice: [1, 10] }).filter(frame => frame.file)
    : undefined
  traceCache.set(string, trace)
  return trace
}
