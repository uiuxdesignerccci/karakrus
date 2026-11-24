import { addAudit, admin } from '../../../utils/admin'
import { requireUser } from '../../../utils/db'

export default defineEventHandler((event) => {
  const me = requireUser(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))
  const role = admin.roles.find((r) => r.id === id)
  if (!role) throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  if (admin.staff.some((s) => s.roleId === id)) throw createError({ statusCode: 409, statusMessage: 'Only roles without assigned staff can be deleted.' })
  admin.roles = admin.roles.filter((r) => r.id !== id)
  addAudit('Deleted role', role.name, me.username)
  return { ok: true }
})
