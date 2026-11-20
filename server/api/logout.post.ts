import { destroySession } from '../utils/db'

export default defineEventHandler((event) => {
  destroySession(event)
  return { ok: true }
})
