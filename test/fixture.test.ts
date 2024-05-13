import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { execa } from 'execa'
import type { RegexDoctorResult } from '../src'

it('vite', async () => {
  const dir = fileURLToPath(new URL('./fixtures/vite', import.meta.url))
  await execa('npx', ['run', 'build'], { cwd: dir, stdio: 'inherit' })
  const data = JSON.parse(await fs.readFile(join(dir, 'regex-doctor.json'), 'utf-8')) as RegexDoctorResult
  expect(data).toBeDefined()
  expect(data.count).toMatchInlineSnapshot()
}, { timeout: 60_000 })
