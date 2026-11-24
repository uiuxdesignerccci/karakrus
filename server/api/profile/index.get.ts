import type { Side } from '../../../types'
import { db, publicUser, requireUser } from '../../utils/db'

export default defineEventHandler((event) => {
  const user = requireUser(event)
  const mine = db.bets.filter((b) => b.user_id === user.id).sort((a, b) => b.created_at - a.created_at)
  const settled = mine.filter((b) => b.payout !== null)
  const wins = settled.filter((b) => (b.payout ?? 0) > 0).length
  const wagered = mine.reduce((s, b) => s + b.amount, 0)
  const returned = settled.reduce((s, b) => s + (b.payout ?? 0), 0)
  const settledStake = settled.reduce((s, b) => s + b.amount, 0)
  const sideCount: Record<Side, number> = { kara: 0, krus: 0 }
  for (const b of mine) sideCount[b.side]++
  const roomName = new Map(db.rooms.map((r) => [r.id, r.name]))

  return {
    user: publicUser(user),
    stats: {
      bets: mine.length,
      settled: settled.length,
      wins,
      wagered,
      net: returned - settledStake,
      favorite: mine.length ? (sideCount.kara >= sideCount.krus ? 'kara' : 'krus') as Side : null,
      sides: sideCount,
    },
    recent: mine.slice(0, 10).map((b) => ({ ...b, room_name: roomName.get(b.room_id) ?? 'Closed table' })),
  }
})
