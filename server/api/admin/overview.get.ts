import type { AdminOverview } from '../../../types'
import { db, requireUser, tickRooms } from '../../utils/db'

export default defineEventHandler((event): AdminOverview => {
  requireUser(event, 'admin')
  tickRooms()
  return {
    verifiedPlayers: db.users.filter((u) => u.role === 'player').length,
    takingBets: db.rooms.filter((r) => r.status === 'open').length,
    roundsCompleted: db.rooms.reduce((n, r) => n + r.history.length, 0),
    fees: db.fees,
    rooms: db.rooms,
    audit: db.audit.slice(0, 20),
  }
})
