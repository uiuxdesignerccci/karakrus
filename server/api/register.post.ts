import type { RegisterBody } from '../../types'
import { createSession, db, publicUser } from '../utils/db'

function ageFrom(birthdate: string): number {
  const b = new Date(birthdate)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) age--
  return age
}

export default defineEventHandler(async (event) => {
  const b = await readBody<Partial<RegisterBody>>(event)
  if (!b?.firstName || !b.lastName || !b.email || !b.username || !b.birthdate) {
    throw createError({ statusCode: 400, statusMessage: 'Please fill in every field' })
  }
  if (!b.password || b.password.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 10 characters' })
  }
  if (!b.ageConfirmed || Number.isNaN(ageFrom(b.birthdate)) || ageFrom(b.birthdate) < 18) {
    throw createError({ statusCode: 400, statusMessage: 'You must be 18 or older' })
  }
  if (db.users.some((u) => u.username.toLowerCase() === b.username!.toLowerCase())) {
    throw createError({ statusCode: 409, statusMessage: 'That username is taken' })
  }
  const user = {
    id: db.users.length + 1,
    username: b.username,
    password: b.password,
    firstName: b.firstName,
    lastName: b.lastName,
    email: b.email,
    role: 'player' as const,
    balance: 100000,
  }
  db.users.push(user)
  createSession(event, user.id)
  return { user: publicUser(user) }
})
