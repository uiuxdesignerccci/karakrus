import { db, requireUser } from '../../../utils/db'

export default defineEventHandler((event) => {
  requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  return { messages: db.chat.filter((m) => m.room_id === id).slice(-100) }
})
