import type { RoomSettingsBody } from '../../../../types'
import { db, logAudit, requireUser } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const admin = requireUser(event, 'admin')
  const room = db.rooms.find((r) => r.id === Number(getRouterParam(event, 'id')))
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  const b = await readBody<Partial<RoomSettingsBody>>(event)

  if (b.name !== undefined) {
    if (!b.name.trim()) throw createError({ statusCode: 400, statusMessage: 'Room name is required' })
    room.name = b.name.trim()
  }
  if (b.subtitle !== undefined) room.subtitle = b.subtitle.trim()
  if (b.visibility) room.visibility = b.visibility === 'vip' ? 'vip' : 'public'
  if (b.duration !== undefined) room.duration = Math.max(5, Math.round(Number(b.duration)))
  const min = b.min_bet !== undefined ? Math.round(Number(b.min_bet) * 100) : room.min_bet
  const max = b.max_bet !== undefined ? Math.round(Number(b.max_bet) * 100) : room.max_bet
  if (!(min > 0) || max < min) throw createError({ statusCode: 400, statusMessage: 'Check the bet limits' })
  room.min_bet = min
  room.max_bet = max

  logAudit('Updated room settings', room, admin.username)
  return { room }
})
