import { RegexDoctor } from './doctor'

export * from './types'
export { RegexDoctor } from './doctor'

export function startRegexDoctor() {
  const doctor = new RegexDoctor()
  doctor.start()
  return doctor
}
