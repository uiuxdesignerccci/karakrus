import { db, requireUser, tickRooms } from '../../utils/db'

export default defineEventHandler((event) => {
  requireUser(event)
  tickRooms()
  return { rooms: db.rooms }
})
