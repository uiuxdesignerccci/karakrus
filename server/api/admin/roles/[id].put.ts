import { addAudit, admin } from '../../../utils/admin'
import { requireUser } from '../../../utils/db'
import { readRoleBody } from '../../../utils/roles'

export default defineEventHandler(async (event) => {
  const me = requireUser(event, 'admin')
  const role = admin.roles.find((r) => r.id === Number(getRouterParam(event, 'id')))
  if (!role) throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  Object.assign(role, await readRoleBody(event))
  addAudit('Updated role', role.name, me.username)
  return { role }
})
