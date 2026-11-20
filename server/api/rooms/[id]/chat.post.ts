import { db, requireUser } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ text?: string }>(event)
  const text = body?.text?.trim() ?? ''
  if (!text || text.length > 500) throw createError({ statusCode: 400, statusMessage: 'Message must be 1–500 characters' })
  const message = { id: db.chat.length + 1, room_id: id, user: user.username, text, created_at: Date.now() }
  db.chat.push(message)
  return { message }
})
