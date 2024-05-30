import { RegexDoctor } from 'regex-doctor'

export default defineEventHandler(async () => {
  return await RegexDoctor.pickup()
})
