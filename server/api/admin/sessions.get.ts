import type { SessionRecord } from '../../../types'
import { admin } from '../../utils/admin'
import { requireUser } from '../../utils/db'

export default defineEventHandler((event): { sessions: SessionRecord[] } => {
  requireUser(event, 'admin')
  return { sessions: [...admin.sessions].sort((a, b) => b.signedInAt - a.signedInAt) }
})
