import type { AdminPlayer, AdminPlayersResponse } from '../../../../types'
import { playerMeta } from '../../../utils/admin'
import { db, requireUser } from '../../../utils/db'

export default defineEventHandler((event): AdminPlayersResponse => {
  requireUser(event, 'admin')
  const online = new Set(db.sessions.values())
  const players: AdminPlayer[] = db.users
    .filter((u) => u.role === 'player')
    .map((u) => {
      const m = playerMeta(u.id)
      return {
        id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName, email: u.email,
        birthdate: m.birthdate, balance: u.balance, verified: m.verified, active: m.active, signedIn: online.has(u.id),
      }
    })
  return {
    metrics: {
      total: players.length,
      active: players.filter((p) => p.active).length,
      blocked: players.filter((p) => !p.active).length,
      signedIn: players.filter((p) => p.signedIn).length,
    },
    players,
  }
})
