import type { LoginBody, RegisterBody, User } from '~/types'

export function useAuth() {
  const user = useState<User | null>('auth:user', () => null)
  const loaded = useState<boolean>('auth:loaded', () => false)

  async function fetchUser() {
    const { user: me } = await $fetch<{ user: User | null }>('/api/me', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    })
    user.value = me
    loaded.value = true
    return me
  }

  async function login(body: LoginBody) {
    const res = await $fetch<{ user: User }>('/api/login', { method: 'POST', body })
    user.value = res.user
    return res.user
  }

  async function register(body: RegisterBody) {
    const res = await $fetch<{ user: User }>('/api/register', { method: 'POST', body })
    user.value = res.user
    return res.user
  }

  async function logout() {
    await $fetch('/api/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  const isAdmin = computed(() => user.value?.role === 'admin')

  return { user, loaded, isAdmin, fetchUser, login, register, logout }
}
