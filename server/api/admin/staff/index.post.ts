import { addAudit, admin, staffView } from '../../../utils/admin'
import { requireUser } from '../../../utils/db'

interface Body { firstName: string; lastName: string; email: string; password: string; roleId: number; roomIds: number[] }

export default defineEventHandler(async (event) => {
  const me = requireUser(event, 'admin')
  const b = await readBody<Partial<Body>>(event)
  if (!b.firstName?.trim() || !b.lastName?.trim() || !b.email?.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Name and a valid email are required.' })
  if (!admin.roles.some((r) => r.id === b.roleId)) throw createError({ statusCode: 400, statusMessage: 'Choose a role.' })
  if ((b.password ?? '').length < 10) throw createError({ statusCode: 400, statusMessage: 'Password must be at least 10 characters.' })
  if (admin.staff.some((s) => s.email.toLowerCase() === b.email!.toLowerCase())) throw createError({ statusCode: 409, statusMessage: 'That email is already in use.' })
  const staff = {
    id: Math.max(0, ...admin.staff.map((s) => s.id)) + 1,
    firstName: b.firstName.trim(), lastName: b.lastName.trim(), email: b.email.trim(),
    isSuperAdmin: false, active: true, roleId: b.roleId!, roomIds: b.roomIds ?? [],
  }
  admin.staff.push(staff)
  addAudit('Created staff account', `${staff.firstName} ${staff.lastName}`, me.username)
  return { staff: staffView(staff) }
})
