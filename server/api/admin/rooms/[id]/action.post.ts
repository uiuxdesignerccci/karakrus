import type { RoundAction, Side } from '../../../../../types'
import { db, logAudit, requireUser, settleRound, tickRooms } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const admin = requireUser(event, 'admin')
  tickRooms()
  const room = db.rooms.find((r) => r.id === Number(getRouterParam(event, 'id')))
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  const { action, result } = await readBody<{ action?: RoundAction; result?: Side }>(event)

  const startRound = (final: 0 | 1) => {
    room.round_number += 1
    room.final = final
    room.status = 'open'
    room.result = null
    room.pool_kara = 0
    room.pool_krus = 0
    room.closes_at = Date.now() + room.duration * 1000
  }

  switch (action) {
    case 'start':
    case 'final':
      if (room.status === 'open' || room.status === 'closed') throw createError({ statusCode: 409, statusMessage: 'A round is already in progress' })
      startRound(action === 'final' ? 1 : 0)
      break
    case 'break':
      if (room.status === 'open' || room.status === 'closed') throw createError({ statusCode: 409, statusMessage: 'Finish the current round first' })
      room.status = 'break'
      room.final = 0
      break
    case 'result':
      if (room.status !== 'closed') throw createError({ statusCode: 409, statusMessage: 'Betting must be closed before confirming a result' })
      if (result !== 'kara' && result !== 'krus') throw createError({ statusCode: 400, statusMessage: 'Confirm the coin face' })
      settleRound(room, result)
      break
    default:
      throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
  }

  logAudit(action === 'result' ? `result ${result}` : action, room, admin.username)
  return { room }
})
