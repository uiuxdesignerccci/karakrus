import type { StreamingBody } from '../../../../../types'
import { db, logAudit, requireUser } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const admin = requireUser(event, 'admin')
  const room = db.rooms.find((r) => r.id === Number(getRouterParam(event, 'id')))
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  const b = await readBody<Partial<StreamingBody>>(event)
  if (b?.provider !== 'srs' && b?.provider !== 'off') throw createError({ statusCode: 400, statusMessage: 'Unknown source' })
  const url = (b.url ?? '').trim()
  if (b.provider === 'srs' && !/^https?:\/\//.test(url)) throw createError({ statusCode: 400, statusMessage: 'Enter a playback URL' })

  if (b.kind === 'staff') {
    room.staff_stream_provider = b.provider
    if (url) room.staff_srs_whep_url = url
    logAudit(`Updated staff streaming; source ${b.provider}`, room, admin.username)
  } else {
    room.stream_provider = b.provider
    if (url) room.srs_whep_url = url
    logAudit(`Updated streaming; source ${b.provider}`, room, admin.username)
  }
  return { room }
})
