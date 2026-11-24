import { addAudit, admin, staffView } from '../../../utils/admin'
import { requireUser } from '../../../utils/db'

interface Body { firstName?: string; lastName?: string; email?: string; roleId?: number; roomIds?: number[]; password?: string; active?: boolean }

export default defineEventHandler(async (event) => {
  const me = requireUser(event, 'admin')
  const staff = admin.staff.find((s) => s.id === Number(getRouterParam(event, 'id')))
  if (!staff) throw createError({ statusCode: 404, statusMessage: 'Staff account not found' })
  if (staff.isSuperAdmin) throw createError({ statusCode: 403, statusMessage: 'This account is protected.' })
  const b = await readBody<Body>(event)
  const name = `${staff.firstName} ${staff.lastName}`
  if (b.firstName !== undefined || b.lastName !== undefined || b.email !== undefined) {
    if (!b.firstName?.trim() || !b.lastName?.trim() || !b.email?.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Name and a valid email are required.' })
    Object.assign(staff, { firstName: b.firstName.trim(), lastName: b.lastName.trim(), email: b.email.trim() })
    addAudit('Updated staff profile', name, me.username)
  } else if (b.roleId !== undefined) {
    if (!admin.roles.some((r) => r.id === b.roleId)) throw createError({ statusCode: 400, statusMessage: 'Choose a role.' })
    staff.roleId = b.roleId
    addAudit('Changed staff role', name, me.username)
  } else if (b.roomIds !== undefined) {
    staff.roomIds = b.roomIds
    addAudit('Assigned rooms', name, me.username)
  } else if (b.password !== undefined) {
    if (b.password.length < 10) throw createError({ statusCode: 400, statusMessage: 'Password must be at least 10 characters.' })
    addAudit('Reset staff password', name, me.username)
  } else if (b.active !== undefined) {
    staff.active = b.active
    addAudit(b.active ? 'Reactivated staff account' : 'Deactivated staff account', name, me.username)
  }
  return { staff: staffView(staff) }
})
