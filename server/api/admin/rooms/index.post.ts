import type { Room, RoomSettingsBody } from '../../../../types'
import { db, logAudit, requireUser } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const admin = requireUser(event, 'admin')
  const b = await readBody<Partial<RoomSettingsBody>>(event)
  if (!b?.name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Room name is required' })
  const min = Number(b.min_bet ?? 10)
  const max = Number(b.max_bet ?? 1000)
  const duration = Number(b.duration ?? 30)
  if (!(min > 0) || !(max >= min)) throw createError({ statusCode: 400, statusMessage: 'Check the bet limits' })
  if (!(duration >= 5)) throw createError({ statusCode: 400, statusMessage: 'Countdown must be at least 5 seconds' })

  const room: Room = {
    id: Math.max(0, ...db.rooms.map((r) => r.id)) + 1,
    name: b.name.trim(),
    subtitle: b.subtitle?.trim() ?? '',
    duration,
    min_bet: Math.round(min * 100),
    max_bet: Math.round(max * 100),
    status: 'waiting',
    final: 0,
    round_number: 0,
    closes_at: null,
    result: null,
    pool_kara: 0,
    pool_krus: 0,
    stream_provider: 'off',
    srs_whep_url: '',
    staff_stream_provider: 'off',
    staff_srs_whep_url: '',
    visibility: b.visibility === 'vip' ? 'vip' : 'public',
    players: 0,
    history: [],
    access: 'accepted',
  }
  db.rooms.push(room)
  logAudit('Created room', room, admin.username)
  return { room }
})
