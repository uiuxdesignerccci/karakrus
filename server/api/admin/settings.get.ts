import { db, requireUser } from '../../utils/db'

export default defineEventHandler((event) => {
  requireUser(event, 'admin')
  return { announcement: db.announcement }
})
