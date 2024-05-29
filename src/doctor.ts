import type { WriteStream } from 'node:fs'
import { createWriteStream, mkdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { RegexDoctorResult } from './types/data'
import type { RecordRegexInfo } from './types/record'
import type { RegexDoctorDumpOptions, RegexDoctorOptions } from './types/options'
import { hijack, listeners, restore } from './hijack'
import { dump } from './dump'
import { loadRegexDoctorConfig } from './config'

export class RegexDoctor {
  map = new Map<RegExp, RecordRegexInfo>()

  duration = 0
  timeStart: number | undefined

  constructor(
    public options: RegexDoctorOptions = {},
  ) { }

  private saveDuration(start: boolean = !!this.timeStart) {
    if (this.timeStart) {
      this.duration += performance.now() - this.timeStart
      this.timeStart = undefined
    }
    if (start)
      this.timeStart = performance.now()
  }

  stop() {
    this.saveDuration(false)
    listeners.delete(this)
    if (!listeners.size)
      restore()
  }

  start() {
    this.saveDuration(true)
    hijack()
    listeners.add(this)

    /**
     * You can also use the `using` syntax to auto dispose the instance
     *
     * @see https://github.com/tc39/proposal-explicit-resource-management
     * @example
     * ```ts
     * {
     *   using _ = doctor.start()
     *   // Your code here
     * }
     * ```
     */
    return {
      [Symbol.dispose]: () => {
        this.stop()
      },
    }
  }

  /**
   * Allow auto dispose the instance
   */
  [Symbol.dispose]() {
    this.dispose()
  }

  dispose() {
    this.stop()
    this.clear()
  }

  async run(fn: Function) {
    this.start()
    try {
      return await fn()
    }
    finally {
      this.stop()
    }
  }

  clear() {
    this.map.clear()
  }

  static async getFilePath() {
    const config = await loadRegexDoctorConfig()
    return path.join(config.rootDir, config.outputDir, config.outputFileName)
  }

  async dump(options: RegexDoctorDumpOptions = {}) {
    this.saveDuration()
    const config = await loadRegexDoctorConfig()
    mkdirSync(path.join(config.rootDir, config.outputDir), { recursive: true })
    const filePath = path.join(config.rootDir, config.outputDir, config.outputFileName)
    const writableStream = createWriteStream(filePath, { encoding: 'utf8' })

    const data = dump(this, options)
    data.cwd = config.rootDir
    const getSpace = (n: number, space = '  ') => space.repeat(n)
    const writeObj = (obj: Record<string, any>, writableStream: WriteStream, indent: number = 0) => {
      writableStream.write(`{`)
      Object.keys(obj)
        .filter(key => obj[key] !== undefined)
        .forEach((k, i, arr) => {
          if (Array.isArray(obj[k])) {
            writableStream.write(`\n${getSpace(indent + 1)}"${k}": [`)
            if (obj[k].length === 0) {
              writableStream.write('],')
              return
            }
            for (let j = 0; j < obj[k].length; j++) {
              const item = obj[k][j]
              // TODO: maybe is Map, Set
              if (typeof item === 'object')
                writeObj(item, writableStream, indent + 1)
              else
                writableStream.write(`\n${getSpace(indent + 2)}${JSON.stringify(item)}`)
              writableStream.write(j < obj[k].length - 1 ? ',' : '')
            }
            writableStream.write(`\n${getSpace(indent + 1)}]${i < arr.length - 1 ? ',' : ''}`)
          }
          else {
            writableStream.write(`\n${getSpace(indent + 1)}"${k}": ${JSON.stringify(obj[k])}${i < arr.length - 1 ? ',' : ''}`)
          }
        })
      writableStream.write(`\n${getSpace(indent)}}`)
    }
    writeObj(data, writableStream, 0)
    writableStream.end()

    return new Promise<void>((resolve, reject) => {
      writableStream.on('finish', resolve)
      writableStream.on('error', reject)
    })
  }

  static async pickup(filePath?: string): Promise<RegexDoctorResult> {
    return JSON.parse(await readFile(filePath || (await RegexDoctor.getFilePath()), { encoding: 'utf8' }))
  }
}
