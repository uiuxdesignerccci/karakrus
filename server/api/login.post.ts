import type { LoginBody } from '../../types'
import { admin } from '../utils/admin'
import { createSession, db, publicUser } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<LoginBody>>(event)
  const user = db.users.find((u) => u.username === body?.username && u.password === body?.password)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  if (user.role === 'player' && admin.playerMeta.get(user.id)?.active === false)
    throw createError({ statusCode: 403, statusMessage: 'This account is blocked. Contact support.' })
  createSession(event, user.id)
  return { user: publicUser(user) }
})
