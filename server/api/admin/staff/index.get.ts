import { admin, staffView } from '../../../utils/admin'
import { requireUser } from '../../../utils/db'

export default defineEventHandler((event) => {
  requireUser(event, 'admin')
  return { staff: admin.staff.map(staffView), roles: admin.roles }
})
