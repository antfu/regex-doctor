/* eslint-disable no-extend-native */

interface RegExpInfo {
  regex: RegExp
  exec: RegExpCall[]
}

interface RegExpCall {
  duration: number
  string?: string
}

class MyRegExp extends RegExp {
  constructor(pattern: string, flags?: string) {
    console.log('MyRegExp')
    super(pattern, flags)
  }
}

globalThis.RegExp = MyRegExp as any

class RegExpMonitor {
  map: Map<RegExp, RegExpInfo> = new Map()

  register() {
    const map = this.map
    const _exec = RegExp.prototype.exec

    RegExp.prototype.exec = function (string: string) {
      if (!map.has(this)) {
        map.set(this, {
          regex: this,
          exec: [],
        })
      }
      const info = map.get(this)!
      const timeStart = performance.now()
      const result = _exec.call(this, string)
      const timeEnd = performance.now()
      const duration = timeEnd - timeStart
      info.exec.push({
        duration,
        string,
      })
      return result
    }
  }
}

const monitor = new RegExpMonitor()
monitor.register()

const regex1 = /play\((\d+)\)/
const regex2 = /play\((\d+),(\d+)\)/
const regex3 = /play\((\d+)\)/

const dynamic = new RegExp('play\\((\\d+)\\)')

;/(a+)$/.test(
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  + 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  + 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  + 'aaaaaaaaaaaaaaa!',
) // Sensitive

'string'.match(regex1) // null
'string'.match(regex2) // null
'string'.match(regex3) // null

console.dir(monitor.map, { depth: 3 })
