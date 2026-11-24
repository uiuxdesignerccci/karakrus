import { db, publicUser, requireUser } from '../../utils/db'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const b = await readBody<{ firstName?: string; lastName?: string; email?: string }>(event)
  const firstName = b?.firstName?.trim() ?? ''
  const lastName = b?.lastName?.trim() ?? ''
  const email = b?.email?.trim() ?? ''
  if (!firstName || !lastName) throw createError({ statusCode: 400, statusMessage: 'Please enter your first and last name' })
  if (firstName.length > 40 || lastName.length > 40) throw createError({ statusCode: 400, statusMessage: 'Names can be up to 40 characters' })
  if (!EMAIL.test(email)) throw createError({ statusCode: 400, statusMessage: 'Please enter a valid email address' })
  if (db.users.some((u) => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase())) {
    throw createError({ statusCode: 409, statusMessage: 'That email is already in use' })
  }
  Object.assign(user, { firstName, lastName, email })
  return { user: publicUser(user) }
})
