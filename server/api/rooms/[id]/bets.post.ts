import type { Side } from '../../../../types'
import { db, requireUser } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const room = db.rooms.find((r) => r.id === id)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  if (room.status !== 'open') throw createError({ statusCode: 409, statusMessage: 'Betting is closed' })

  const body = await readBody<{ side?: Side; amount?: number }>(event)
  const amount = Math.round((body?.amount ?? 0) * 100)
  if (body?.side !== 'kara' && body?.side !== 'krus') throw createError({ statusCode: 400, statusMessage: 'Pick a side' })
  if (amount < room.min_bet || amount > room.max_bet) throw createError({ statusCode: 400, statusMessage: 'Bet is outside the room limits' })
  if (amount > user.balance) throw createError({ statusCode: 400, statusMessage: 'Not enough credits' })

  user.balance -= amount
  if (body.side === 'kara') room.pool_kara += amount
  else room.pool_krus += amount
  const bet = { id: db.bets.length + 1, user_id: user.id, room_id: id, round_number: room.round_number, side: body.side, amount, payout: null, created_at: Date.now() }
  db.bets.push(bet)
  return { bet, balance: user.balance }
})
