import { db, requireUser } from '../../utils/db'

export default defineEventHandler(async (event) => {
  requireUser(event, 'admin')
  const { announcement } = await readBody<{ announcement?: string }>(event)
  db.announcement = (announcement ?? '').trim().slice(0, 200)
  return { announcement: db.announcement }
})
