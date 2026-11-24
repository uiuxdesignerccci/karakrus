import { requireUser } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const b = await readBody<{ current?: string; next?: string }>(event)
  if (b?.current !== user.password) throw createError({ statusCode: 400, statusMessage: 'Current password is incorrect' })
  if (!b.next || b.next.length < 10) throw createError({ statusCode: 400, statusMessage: 'New password must be at least 10 characters' })
  if (b.next === b.current) throw createError({ statusCode: 400, statusMessage: 'Choose a password different from your current one' })
  user.password = b.next
  return { ok: true }
})
