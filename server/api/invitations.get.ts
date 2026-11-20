import { db, requireUser } from '../utils/db'

export default defineEventHandler((event) => {
  requireUser(event)
  return { invitations: db.invitations }
})
