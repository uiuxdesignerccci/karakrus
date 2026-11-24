import { addAudit, endSessionsFor, playerMeta } from '../../../../utils/admin'
import { db, requireUser } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const me = requireUser(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))
  const player = db.users.find((u) => u.id === id && u.role === 'player')
  if (!player) throw createError({ statusCode: 404, statusMessage: 'Player not found' })
  const { active } = await readBody<{ active: boolean }>(event)
  playerMeta(id).active = !!active
  if (!active) endSessionsFor(id)
  addAudit(active ? 'Unblocked player' : 'Blocked player', player.username, me.username)
  return { ok: true }
})
