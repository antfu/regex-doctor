import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { expect, it } from 'vitest'
import { execa } from 'execa'
import { RegexDoctor } from 'regex-doctor'

it('vite', async () => {
  const dir = fileURLToPath(new URL('./fixtures/vite', import.meta.url))
  await execa('pnpm', ['run', 'build'], { cwd: dir, stdio: 'inherit' })
  // TODO: read file path from regex-doctor config file
  const data = await RegexDoctor.pickup(path.join(dir, './.regex-doctor/output.bin'))
  expect(data).toBeDefined()
  expect(data.count).toBeGreaterThan(0)
}, { timeout: 60_000 })
