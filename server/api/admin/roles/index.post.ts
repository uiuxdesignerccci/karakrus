import { addAudit, admin } from '../../../utils/admin'
import { requireUser } from '../../../utils/db'
import { readRoleBody } from '../../../utils/roles'

export default defineEventHandler(async (event) => {
  const me = requireUser(event, 'admin')
  const { name, permissions } = await readRoleBody(event)
  const role = { id: Math.max(0, ...admin.roles.map((r) => r.id)) + 1, name, permissions }
  admin.roles.push(role)
  addAudit('Created role', name, me.username)
  return { role }
})
