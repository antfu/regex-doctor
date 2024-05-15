import type { StackFrameLite } from 'error-stack-parser-es/lite'
import { parseStack } from 'error-stack-parser-es/lite'
import { getTrace } from 'trace-record'
import type { RecordRegexCall, RecordRegexInfo, RegexCall, RegexDoctorDumpFiltersOptions, RegexDoctorDumpOptions, RegexDoctorResult, RegexInfo } from './types'
import { extractPackagePath, normalizeFilepath } from './shared/path'
import type { RegexDoctor } from './doctor'

const defaultFilters: Required<RegexDoctorDumpFiltersOptions> = {
  top: 20,
  minCalls: 1000,
  minCopies: 50,
  minDurationSum: 0.3,
  minDurationAvg: 0.1,
  minDurationMax: 0.2,
  maximumAmount: 300,
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
  const uniqueMap = new Map<string, RegexInfo>()
  const recordMap = new Map<RegexInfo, RecordRegexInfo[]>()

  for (const record of map.values()) {
    const key = `${record.regex.source}--${record.regex.flags}${record.dynamic ? '--dynamic' : ''}`
    const info: RegexInfo = uniqueMap.get(key) || <RegexInfo>{
      no: uniqueMap.size,
      pattern: record.regex.source,
      flags: record.regex.flags,
      dynamic: record.dynamic,
      calls: 0,
      matches: 0,
      copies: 0,
      filesCreated: [],
      filesCalled: [],
      packages: [],
      callsInfos: [],
      traces: [],
      sum: 0,
      min: Number.POSITIVE_INFINITY,
      max: 0,

      matchRate: 0,
      avg: 0,
    }

    uniqueMap.set(key, info)

    if (!recordMap.has(info))
      recordMap.set(info, [])
    recordMap.get(info)!.push(record)

    info.copies++
    info.calls += record.calls.length

    for (const call of record.calls) {
      const d = call.duration
      totalExecution += d

      info.sum += d
      if (d < info.min)
        info.min = d
      if (d > info.max)
        info.max = d
      if (call.matched)
        info.matches++
    }
  }

  let infos = Array.from(uniqueMap.values())

  infos = infos
    .sort((a, b) => b.sum - a.sum)
    .filter((info, idx) => {
      if (idx < filters.top)
        return true
      if (info.calls >= filters.minCalls)
        return true
      if (info.copies >= filters.minCopies)
        return true
      if (info.sum >= filters.minDurationSum)
        return true
      if (info.avg >= filters.minDurationAvg)
        return true
      if (info.max >= filters.minDurationMax)
        return true
      return false
    })

  if (filters.maximumAmount > 0 && infos.length > filters.maximumAmount)
    infos = infos.slice(0, filters.maximumAmount)

  for (const info of infos) {
    info.avg = info.sum / info.calls
    info.matchRate = info.matches / info.calls

    const records = recordMap.get(info)!
    const traceIndex = new Map<string, number>()

    for (const record of records) {
      // Get file creation path from `trace-record`
      {
        let filepath = record.filepath
        if (!filepath) {
          const trace = getTrace(record.regex)
            ?.find(frame => frame.file)
          if (trace)
            filepath = `${normalizeFilepath(trace.file!)}:${trace.line!}:${trace.col!}`
        }

        if (filepath) {
          if (!info.filesCreated.includes(filepath))
            info.filesCreated.push(filepath)
          const r = extractPackagePath(filepath)
          if (r.package && !info.packages.includes(r.package))
            info.packages.push(r.package)
        }
      }

      // Covert call records
      for (const callRecord of record.calls) {
        if (callRecord.duration < info.avg)
          continue

        const call = convertCallRecord(callRecord)
        info.callsInfos.push(call)
        if (callRecord.stack) {
          if (traceIndex.has(callRecord.stack)) {
            call.trace = traceIndex.get(callRecord.stack)!
          }
          else {
            const trace = parseStacktrace(callRecord.stack)
            if (trace && trace[0]) {
              const file = `${normalizeFilepath(trace[0].file!)}:${trace[0].line!}:${trace[0].col!}`
              const index = info.traces?.length
              traceIndex.set(callRecord.stack, index)
              call.trace = index
              info.traces.push(trace)
              info.filesCalled.push(file)
              const r = extractPackagePath(file)
              if (r.package && !info.packages.includes(r.package))
                info.packages.push(r.package)
            }
          }
        }
      }

      info.callsInfos = info.callsInfos
        .sort((a, b) => b.duration - a.duration)
        .slice(0, limitCalls)
    }
  }

  function convertCallRecord(call: RecordRegexCall): RegexCall {
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
      matched: call.matched,
      index: call.index,
      groups: call.groups,
      matchLength: call.matchLength,
    }
  }

  return {
    count: map.size,
    countUnique: uniqueMap.size,
    totalDuration: doctor.duration,
    totalExecution,
    regexInfos: infos,
    cwd: options.cwd,
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
