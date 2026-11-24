import { admin } from '../../../utils/admin'
import { requireUser } from '../../../utils/db'

export default defineEventHandler((event) => {
  requireUser(event, 'admin')
  return { roles: admin.roles.map((r) => ({ ...r, staffCount: admin.staff.filter((s) => s.roleId === r.id).length })) }
})
