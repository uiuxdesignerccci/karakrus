import type { H3Event } from 'h3'
import { PERMISSIONS } from '../../utils/permissions'

export async function readRoleBody(event: H3Event) {
  const b = await readBody<{ name?: string; permissions?: string[] }>(event)
  const name = b?.name?.trim() ?? ''
  if (!name || name.length > 60) throw createError({ statusCode: 400, statusMessage: 'Enter a role name up to 60 characters.' })
  const permissions = [...new Set((b.permissions ?? []).filter((p) => p in PERMISSIONS))]
  return { name, permissions }
}
