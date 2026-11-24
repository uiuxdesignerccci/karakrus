import type { AuditActorKind, AuditOutcome, AuditRecord, SessionRecord, StaffAccount, StaffRole } from '../../types'
import { db } from './db'

interface PlayerMeta { verified: boolean; active: boolean; birthdate: string }
interface StoredStaff extends Omit<StaffAccount, 'role' | 'activeSessions'> { roleId: number | null }

interface AdminStore {
  playerMeta: Map<number, PlayerMeta>
  roles: StaffRole[]
  staff: StoredStaff[]
  audit: AuditRecord[]
  sessions: SessionRecord[]
}

const H = 60 * 60 * 1000

function seed(): AdminStore {
  const now = Date.now()
  const at = (hoursAgo: number) => now - hoursAgo * H
  const audit: Array<[number, string, string, number | null, string, AuditActorKind, AuditOutcome]> = [
    [0.3, 'Opened betting', 'Round #001', 1, 'admin', 'staff', 'succeeded'],
    [0.5, 'Updated streaming; source srs', 'The Golden Room', 1, 'admin', 'staff', 'succeeded'],
    [1.2, 'Signed in', 'Admin console', null, 'admin', 'staff', 'succeeded'],
    [2, 'Sign-in attempt', 'Admin console', null, 'unknown', 'unauthenticated', 'failed'],
    [3.5, 'Coin result detected', 'Round #000 · Krus', 2, 'Coin detector', 'detector', 'succeeded'],
    [5, 'Blocked player', 'bea.l', null, 'admin', 'staff', 'succeeded'],
    [6, 'Created room', 'The High Table', 3, 'admin', 'staff', 'succeeded'],
    [8, 'Assigned rooms', 'Rina Cruz', null, 'admin', 'staff', 'succeeded'],
    [12, 'Expired sessions cleaned up', 'Account / portal', null, 'System', 'system', 'succeeded'],
    [20, 'Settled round', 'Round #000 · Kara', 2, 'rina', 'staff', 'succeeded'],
    [26, 'Updated club announcement', 'Settings', null, 'admin', 'staff', 'succeeded'],
    [30, 'Settle round', 'Round #000', 4, 'paolo', 'staff', 'failed'],
  ]
  const sessions: Array<[string, string, 'staff' | 'player', string, string, number, number | null, SessionRecord['endReason']]> = [
    ['Kara Admin', 'admin', 'staff', 'Chrome on macOS', 'Makati, PH', 1.2, null, null],
    ['Alex Reyes', 'player', 'player', 'Safari on iPhone', 'Quezon City, PH', 0.8, null, null],
    ['Maria Santos', 'maria.s', 'player', 'Chrome on Android', 'Cebu City, PH', 3, null, null],
    ['Rina Cruz', 'rina@local.invalid', 'staff', 'Edge on Windows', 'Pasig, PH', 22, 14, 'logout'],
    ['Juan Dela Cruz', 'jdc', 'player', 'Firefox on Windows', 'Local network', 30, 29, 'replaced'],
    ['Bea Lim', 'bea.l', 'player', 'Chrome on Android', 'Davao City, PH', 50, 5, 'deactivated'],
    ['Paolo Garcia', 'paolo@local.invalid', 'staff', 'Chrome on macOS', 'Taguig, PH', 80, 56, 'expired'],
    ['Alex Reyes', 'player', 'player', 'Safari on iPhone', 'Quezon City, PH', 96, 90, 'password_changed'],
  ]
  return {
    playerMeta: new Map([
      [2, { verified: true, active: true, birthdate: '1994-03-12' }],
      [5, { verified: true, active: true, birthdate: '1990-07-28' }],
      [6, { verified: false, active: true, birthdate: '2001-11-02' }],
      [7, { verified: true, active: false, birthdate: '1997-01-19' }],
    ]),
    roles: [
      { id: 1, name: 'Host', permissions: ['dashboard.view', 'rooms.view', 'rounds.start', 'rounds.settle', 'streams.update', 'chat.moderate'] },
      { id: 2, name: 'Floor manager', permissions: ['dashboard.view', 'audit.view', 'rooms.view', 'rooms.update', 'players.view', 'players.set_status', 'staff.view'] },
      { id: 3, name: 'Camera operator', permissions: ['rooms.view', 'staff_streams.update'] },
    ],
    staff: [
      { id: 1, firstName: 'Kara', lastName: 'Admin', email: 'admin@local.invalid', isSuperAdmin: true, active: true, roleId: null, roomIds: [] },
      { id: 2, firstName: 'Rina', lastName: 'Cruz', email: 'rina@local.invalid', isSuperAdmin: false, active: true, roleId: 1, roomIds: [1, 2] },
      { id: 3, firstName: 'Paolo', lastName: 'Garcia', email: 'paolo@local.invalid', isSuperAdmin: false, active: true, roleId: 2, roomIds: [1, 2, 3, 4] },
      { id: 4, firstName: 'Mika', lastName: 'Tan', email: 'mika@local.invalid', isSuperAdmin: false, active: false, roleId: 3, roomIds: [3] },
    ],
    audit: audit.map(([h, action, target, room_id, actor, actorKind, outcome], i) => ({
      id: audit.length - i, action, target, room_id, actor, actorKind, outcome, created_at: at(h),
    })),
    sessions: sessions.map(([accountName, username, accountKind, device, location, h, endedH, endReason], i) => ({
      id: sessions.length - i, accountName, username, accountKind, device, location,
      signedInAt: at(h), lastActiveAt: endedH === null ? at(Math.min(h, 0.1)) : at(endedH), expiresAt: at(h - 24 * 7),
      endedAt: endedH === null ? null : at(endedH), endReason,
    })),
  }
}

const g = globalThis as typeof globalThis & { __krusAdmin?: AdminStore }
export const admin: AdminStore = (g.__krusAdmin ??= seed())

export function addAudit(action: string, target: string, actor: string, outcome: AuditOutcome = 'succeeded', room_id: number | null = null) {
  admin.audit.unshift({ id: admin.audit.length + 1, action, target, room_id, actor, actorKind: 'staff', outcome, created_at: Date.now() })
}

export function playerMeta(id: number): PlayerMeta {
  let m = admin.playerMeta.get(id)
  if (!m) admin.playerMeta.set(id, (m = { verified: true, active: true, birthdate: '' }))
  return m
}

/** Signs a user out of every session (used when a player is blocked). */
export function endSessionsFor(userId: number) {
  for (const [token, id] of db.sessions) if (id === userId) db.sessions.delete(token)
}

export function staffView(s: StoredStaff): StaffAccount {
  const role = admin.roles.find((r) => r.id === s.roleId)
  const { roleId: _roleId, ...rest } = s
  return { ...rest, role: role ? { id: role.id, name: role.name } : null, activeSessions: s.active && s.isSuperAdmin ? 1 : 0 }
}
