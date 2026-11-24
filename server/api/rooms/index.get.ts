import { db, getSessionUser, guestRoom, tickRooms } from '../../utils/db'

export default defineEventHandler((event) => {
  const user = getSessionUser(event)
  tickRooms()
  return { rooms: user ? db.rooms : db.rooms.map(guestRoom) }
})
