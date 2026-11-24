import type { AuditRecord } from '../../../types'
import { admin } from '../../utils/admin'
import { db, requireUser } from '../../utils/db'

/** Audit records: the seeded/admin log plus room host actions from the game log. */
export default defineEventHandler((event): { records: AuditRecord[] } => {
  requireUser(event, 'admin')
  const roomLog: AuditRecord[] = db.audit.map((a) => ({
    id: 100000 + a.id,
    action: a.action,
    target: a.room_name,
    room_id: db.rooms.find((r) => r.name === a.room_name)?.id ?? null,
    actor: a.actor,
    actorKind: 'staff',
    outcome: 'succeeded',
    created_at: a.created_at,
  }))
  return { records: [...roomLog, ...admin.audit].sort((a, b) => b.created_at - a.created_at) }
})
