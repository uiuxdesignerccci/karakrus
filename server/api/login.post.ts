import type { LoginBody } from '../../types'
import { createSession, db, publicUser } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<LoginBody>>(event)
  const user = db.users.find((u) => u.username === body?.username && u.password === body?.password)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  createSession(event, user.id)
  return { user: publicUser(user) }
})
