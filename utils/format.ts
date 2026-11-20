import type { Room, RoomStatus, Side } from '~/types'

export const FEE_RATE = 0.05

/** Centi-credits → display string, e.g. 100000 → "1,000". */
export function formatCredits(centi: number): string {
  const value = centi / 100
  return value.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 2,
  })
}

export const STATUS_LABEL: Record<RoomStatus, string> = {
  waiting: 'Waiting for host',
  open: 'Betting open',
  closed: 'Toss in progress',
  break: 'On a break',
}

export const SIDE_LABEL: Record<Side, string> = {
  kara: 'Kara',
  krus: 'Krus',
}

/**
 * Estimated return for a new bet on `side`:
 * (bet / winning-side pool) × (total pool × 0.95), pools including the new bet.
 */
export function estimateReturn(room: Pick<Room, 'pool_kara' | 'pool_krus'>, side: Side, bet: number, existing = 0): number {
  const sidePool = (side === 'kara' ? room.pool_kara : room.pool_krus) + bet
  const total = room.pool_kara + room.pool_krus + bet
  const mine = existing + bet
  if (sidePool <= 0) return 0
  return (mine / sidePool) * total * (1 - FEE_RATE)
}
