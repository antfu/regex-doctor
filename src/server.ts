import { join } from 'node:path'
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createApp, eventHandler, getQuery, serveStatic, toNodeListener } from 'h3'
import { lookup } from 'mrmime'
import { uiDistDir } from './dirs'

export interface CreateServerOptions {
  cwd: string
  dataPath: string
}

export async function createHostServer(options: CreateServerOptions) {
  const app = createApp()

  const fileMap = new Map<string, Promise<string | undefined>>()
  const readCachedFile = (id: string) => {
    if (!fileMap.has(id))
      fileMap.set(id, readFile(id, 'utf-8').catch(() => undefined))
    return fileMap.get(id)
  }

  app.use('/api/payload.json', eventHandler(async (event) => {
    event.node.res.setHeader('Content-Type', 'application/json')
    return event.node.res.end(await readFile(options.dataPath, 'utf-8'))
  }))

  app.use('/api/launch', eventHandler(async (event) => {
    const query = getQuery(event)
    try {
      // @ts-expect-error missing types
      await import('launch-editor').then(r => (r.default || r)(query.file))
    }
    catch (e) {
      console.error(e)
    }
    return undefined
  }))

  app.use('/', eventHandler(async (event) => {
    const result = await serveStatic(event, {
      fallthrough: true,
      getContents: id => readCachedFile(join(uiDistDir, id)),
      getMeta: async (id) => {
        const stats = await stat(join(uiDistDir, id)).catch(() => {})
        if (!stats || !stats.isFile())
          return
        return {
          type: lookup(id),
          size: stats.size,
          mtime: stats.mtimeMs,
        }
      },
    })

    if (result === false)
      return readCachedFile(join(uiDistDir, 'index.html'))
  }))

  return createServer(toNodeListener(app))
}
