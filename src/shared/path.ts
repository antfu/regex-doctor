export function extractPackagePath(filepath: string): { package?: string, path: string } {
  if (filepath.startsWith('node:')) {
    const name = filepath.match(/^node:([^:]+)/)?.[0]
    if (name) {
      return {
        package: name,
        path: filepath.slice(name.length),
      }
    }
  }

  if (!filepath.includes('/node_modules/'))
    return { path: filepath }

  const match = [...filepath?.matchAll(/\/node_modules\//g)]
  const last = match[match.length - 1]
  if (!last)
    return { path: filepath }

  const packageName = filepath.slice(last.index + last[0].length)
    .match(/^(@[^/]+\/[^/]+)|([^/]+)/)?.[0]

  if (!packageName)
    return { path: filepath }

  return {
    package: packageName,
    path: filepath.slice(last.index + last[0].length + packageName.length),
  }
}

export function normalizeFilepath(filepath: string) {
  filepath = filepath.replace(/\\/g, '/')

  // TODO: seems like a bug in `error-stack-parser-es`
  if (filepath.startsWith('async '))
    filepath = filepath.slice(6)
  // normalize file path
  if (filepath.startsWith('file://'))
    filepath = filepath.slice(7)
  return filepath
}

export function extractCodeLocation(filepath: string): [file: string, line?: string, col?: string] {
  // Fail-fast but return locations like "(native)"
  if (!filepath.includes(':'))
    return [filepath, undefined, undefined]

  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/
  const parts = regExp.exec(filepath.replace(/[()]/g, ''))!
  return [parts[1], parts[2] || undefined, parts[3] || undefined] as const
}

export function stringifyCodeLocation(filepath: string, line?: number | string, col?: number | string) {
  if (line == null)
    return filepath
  filepath += `:${line}`
  if (col == null)
    return filepath
  return `${filepath}:${col}`
}
