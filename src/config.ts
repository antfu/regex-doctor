import process from 'node:process'
import { loadConfig } from 'c12'
import type { RegexDoctorConfig } from './types'

export function defineRegexDoctorConfig(config: RegexDoctorConfig) {
  return config
}

const defaultFileData: Required<RegexDoctorConfig> = {
  rootDir: '.',
  outputDir: '.regex-doctor',
  outputFileName: 'output.json',
}

export async function loadRegexDoctorConfig() {
  const { config, cwd } = await loadConfig({
    name: 'regex-doctor',
    configFile: 'regex-doctor.config',
  })

  return {
    ...defaultFileData,
    rootDir: cwd ?? process.cwd(),
    ...config,
  } satisfies Required<RegexDoctorConfig>
}
