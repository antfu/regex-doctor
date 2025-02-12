/* eslint-disable no-console */
import process from 'node:process'
import { resolve } from 'node:path'
import open from 'open'
import { getPort } from 'get-port-please'
import cac from 'cac'
import { blue, green } from 'ansis'
import { createHostServer } from './server'

// const MARK_CHECK = green('✔')
const MARK_INFO = blue('ℹ')

const cli = cac('regex-doctor')

cli
  .command('view', 'Start a dev server to show the viewer')
  .option('--data <path>', 'JSON data file path')
  .option('--host <host>', 'Host', { default: process.env.HOST || '127.0.0.1' })
  .option('--port <port>', 'Port', { default: process.env.PORT || 7777 })
  .option('--open', 'Open browser', { default: true })
  // Action
  .action(async (options) => {
    const host = options.host
    const port = await getPort({ port: options.port, portRange: [7777, 9000], host })

    if (process.env.ESLINT_CONFIG)
      options.config ||= process.env.ESLINT_CONFIG

    console.log(MARK_INFO, `Starting RegexDoctor viewer at`, green`http://${host}:${port}`, '\n')

    const cwd = process.cwd()
    const server = await createHostServer({
      cwd,
      dataPath: resolve(cwd, options.data || '.regex-doctor/output.json'),
    })

    server.listen(port, host, async () => {
      if (options.open)
        await open(`http://${host === '127.0.0.1' ? 'localhost' : host}:${port}`)
    })
  })

cli
  .command('', 'Show help')
  .action(() => {
    cli.outputHelp()
    process.exit(1)
  })

cli.help()
cli.parse()
