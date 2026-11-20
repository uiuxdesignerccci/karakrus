import { db } from '../utils/db'

export default defineEventHandler(() => ({ announcement: db.announcement }))
