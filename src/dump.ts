import type { StackFrameLite } from 'error-stack-parser-es/lite'
import { parseStack } from 'error-stack-parser-es/lite'
import { getTrace } from 'trace-record'
import type { MergedRecordRegexInfo, RecordRegexInfo, RegexCall, RegexCallsSummary, RegexDoctorDumpFiltersOptions, RegexDoctorDumpOptions, RegexDoctorResult, RegexInfo } from './types'
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
        summary: undefined!,
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
    info.summary = getDurations(info)
    totalExecution += info.summary.sum
  })
  infos.sort((a, b) => b.summary!.sum - a.summary!.sum)

  infos = infos.filter((info, idx) => {
    if (idx < filters.top)
      return true
    if (info.calls.length >= filters.minCalls)
      return true
    if (info.copies >= filters.minCopies)
      return true
    if (info.summary.sum >= filters.minDurationSum)
      return true
    if (info.summary.avg >= filters.minDurationAvg)
      return true
    if (info.summary.max >= filters.minDurationMax)
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
          input.push({ text: call.input })
        }
        else if (call.index != null) {
          const preLength = Math.round(limitInputLength * 0.3)
          const startIndex = Math.max(0, Math.round(call.index - preLength))
          const endIndex = Math.min(call.input.length, startIndex + limitInputLength)
          if (startIndex > 0)
            input.push(startIndex)
          const startText = call.input.slice(startIndex, call.index)
          const matchEndIndex = call.index + (call.matchLength || 0)
          const matchedText = call.input.slice(call.index, matchEndIndex)
          const endText = call.input.slice(matchEndIndex, endIndex)
          if (startText)
            input.push({ text: startText })
          input.push({ text: matchedText, matched: true })
          if (endText)
            input.push({ text: endText })
          const rest = call.inputLength - endIndex
          if (rest > 0)
            input.push(rest)
        }
        else {
          const snippet = call.input.slice(0, limitInputLength)
          input.push({ text: snippet })
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
        matchLength: call.matchLength,
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
      summary: info.summary || getDurations(info),
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

function getDurations(info: RecordRegexInfo): RegexCallsSummary {
  let sum = 0
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  info.calls
    .forEach((call) => {
      sum += call.duration
      min = Math.min(min, call.duration)
      max = Math.max(max, call.duration)
    })

  const countMatches = info.calls.filter(call => call.matched).length

  return {
    countCalls: info.calls.length,
    countMatches,
    matchRate: countMatches / info.calls.length,
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
