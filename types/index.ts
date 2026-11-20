export type Role = 'player' | 'admin'

export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  role: Role
  /** Balance in centi-credits (100 = 1 CR). */
  balance: number
}

export type RoomStatus = 'waiting' | 'open' | 'closed' | 'break'
export type StreamProvider = 'srs' | 'off'
export type Side = 'kara' | 'krus'
export type RoomVisibility = 'public' | 'vip'
export type RoomAccess = 'accepted' | 'pending' | 'none'

export interface RoundResult {
  round: number
  result: Side
  pool: number
}

export interface Room {
  id: number
  name: string
  subtitle: string
  duration: number
  /** Amounts below are centi-credits. */
  min_bet: number
  max_bet: number
  status: RoomStatus
  final: 0 | 1
  round_number: number
  closes_at: number | null
  result: Side | null
  pool_kara: number
  pool_krus: number
  stream_provider: StreamProvider
  srs_whep_url: string
  staff_stream_provider: StreamProvider
  staff_srs_whep_url: string
  visibility: RoomVisibility
  players: number
  history: RoundResult[]
  access: RoomAccess
}

export interface Bet {
  id: number
  user_id: number
  room_id: number
  round_number: number
  side: Side
  amount: number
  payout: number | null
  created_at: number
}

export interface ChatMessage {
  id: number
  room_id: number
  user: string
  text: string
  created_at: number
}

export interface Invitation {
  id: number
  room_id: number
  room_name: string
  status: 'pending' | 'accepted' | 'declined'
}

export interface AuditEntry {
  id: number
  action: string
  room_name: string
  actor: string
  created_at: number
}

export interface AdminOverview {
  verifiedPlayers: number
  takingBets: number
  roundsCompleted: number
  fees: number
  rooms: Room[]
  audit: AuditEntry[]
}

export type RoundAction = 'start' | 'break' | 'final' | 'result'

export interface RoomSettingsBody {
  visibility: RoomVisibility
  name: string
  subtitle: string
  /** CR (not centi-credits). */
  min_bet: number
  max_bet: number
  duration: number
}

export interface StreamingBody {
  kind: 'host' | 'staff'
  provider: StreamProvider
  url: string
}

export interface LoginBody {
  username: string
  password: string
}

export interface RegisterBody {
  firstName: string
  lastName: string
  birthdate: string
  email: string
  username: string
  password: string
  ageConfirmed: boolean
}
