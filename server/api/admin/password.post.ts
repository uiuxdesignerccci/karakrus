import { requireUser } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const admin = requireUser(event, 'admin')
  const b = await readBody<{ current?: string; next?: string }>(event)
  if (b?.current !== admin.password) throw createError({ statusCode: 400, statusMessage: 'Current password is incorrect' })
  if (!b.next || b.next.length < 10) throw createError({ statusCode: 400, statusMessage: 'New password must be at least 10 characters' })
  admin.password = b.next
  return { ok: true }
})
