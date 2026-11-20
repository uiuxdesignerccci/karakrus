import { db, requireUser, tickRooms } from '../../utils/db'

export default defineEventHandler((event) => {
  const user = requireUser(event)
  tickRooms()
  const id = Number(getRouterParam(event, 'id'))
  const room = db.rooms.find((r) => r.id === id)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  const bets = db.bets.filter((b) => b.room_id === id && b.user_id === user.id).slice(-50).reverse()
  return { room, bets }
})
