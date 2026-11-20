import type { H3Event } from 'h3'
import type { AuditEntry, Bet, ChatMessage, Invitation, Room, Side, User } from '../../types'

interface StoredUser extends User {
  password: string
}

interface Db {
  users: StoredUser[]
  rooms: Room[]
  bets: Bet[]
  chat: ChatMessage[]
  invitations: Invitation[]
  audit: AuditEntry[]
  announcement: string
  fees: number
  sessions: Map<string, number>
}

const base = {
  final: 0 as const,
  closes_at: null,
  result: null,
  pool_kara: 0,
  pool_krus: 0,
  stream_provider: 'off' as const,
  srs_whep_url: '',
  staff_stream_provider: 'off' as const,
  staff_srs_whep_url: '',
  visibility: 'public' as const,
  players: 0,
  history: [],
  access: 'accepted' as const,
}

function seed(): Db {
  return {
    users: [
      { id: 1, username: 'admin', password: 'MidnightAdmin123!', firstName: 'Kara', lastName: 'Admin', email: 'admin@local.invalid', role: 'admin', balance: 0 },
      { id: 2, username: 'player', password: 'MidnightPlayer123!', firstName: 'Alex', lastName: 'Reyes', email: 'player@local.invalid', role: 'player', balance: 100000 },
    ],
    rooms: [
      { ...base, id: 3, name: 'The High Table', subtitle: 'Bigger pools. Same single coin.', duration: 60, min_bet: 10000, max_bet: 500000, status: 'waiting', round_number: 0 },
      { ...base, id: 4, name: 'sad', subtitle: 'sad', duration: 30, min_bet: 1000, max_bet: 100000, status: 'closed', round_number: 1 },
      { ...base, id: 1, name: 'The Golden Room', subtitle: 'The original. Always a good place to start.', duration: 30, min_bet: 1000, max_bet: 100000, status: 'break', round_number: 0 },
      { ...base, id: 2, name: 'Midnight Club', subtitle: 'For the night owls and the bold calls.', duration: 45, min_bet: 5000, max_bet: 200000, status: 'waiting', round_number: 0 },
    ],
    bets: [],
    chat: [],
    invitations: [],
    audit: [],
    announcement: '',
    fees: 0,
    sessions: new Map(),
  }
}

const g = globalThis as typeof globalThis & { __krusDb?: Db }
export const db: Db = (g.__krusDb ??= seed())

export function logAudit(action: string, room: Room, actor: string) {
  db.audit.unshift({ id: db.audit.length + 1, action, room_name: room.name, actor, created_at: Date.now() })
}

/** Auto-close betting when the countdown reaches zero. */
export function tickRooms() {
  const now = Date.now()
  for (const r of db.rooms) {
    if (r.status === 'open' && r.closes_at && r.closes_at <= now) r.status = 'closed'
  }
}

/** Settle the current round: winners share 95% of the pool; refund everyone if nobody backed the winner. */
export function settleRound(room: Room, result: Side) {
  const bets = db.bets.filter((b) => b.room_id === room.id && b.round_number === room.round_number && b.payout === null)
  const total = room.pool_kara + room.pool_krus
  const winPool = result === 'kara' ? room.pool_kara : room.pool_krus
  const pay = (b: Bet, amount: number) => {
    b.payout = amount
    const u = db.users.find((x) => x.id === b.user_id)
    if (u) u.balance += amount
  }
  if (winPool === 0) {
    bets.forEach((b) => pay(b, b.amount))
  } else {
    const prize = Math.floor(total * 0.95)
    for (const b of bets) pay(b, b.side === result ? Math.floor((b.amount / winPool) * prize) : 0)
    db.fees += total - prize
  }
  room.history = [{ round: room.round_number, result, pool: total }, ...room.history].slice(0, 12)
  room.result = result
  room.status = 'break'
  room.closes_at = null
}

const COOKIE = 'kk_session'

export function publicUser(u: StoredUser): User {
  const { password: _password, ...rest } = u
  return rest
}

export function createSession(event: H3Event, userId: number) {
  const token = crypto.randomUUID()
  db.sessions.set(token, userId)
  setCookie(event, COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
}

export function destroySession(event: H3Event) {
  const token = getCookie(event, COOKIE)
  if (token) db.sessions.delete(token)
  deleteCookie(event, COOKIE, { path: '/' })
}

export function getSessionUser(event: H3Event): StoredUser | null {
  const token = getCookie(event, COOKIE)
  const id = token ? db.sessions.get(token) : undefined
  return db.users.find((u) => u.id === id) ?? null
}

export function requireUser(event: H3Event, role?: User['role']): StoredUser {
  const user = getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not signed in' })
  if (role && user.role !== role) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  return user
}
