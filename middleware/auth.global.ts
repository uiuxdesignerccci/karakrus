const PUBLIC_PATHS = new Set(['/', '/login', '/register', '/admin/login'])

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, loaded, fetchUser } = useAuth()
  if (!loaded.value) await fetchUser()

  // Room pages are viewable signed out; the page itself hides the stream, chat and betting.
  const isPublic = PUBLIC_PATHS.has(to.path) || /^\/rooms\/[^/]+$/.test(to.path)
  const isAdminPath = to.path.startsWith('/admin')

  if (isAdminPath && to.path !== '/admin/login') {
    if (user.value?.role !== 'admin') return navigateTo('/admin/login')
    return
  }

  if (!isPublic && !user.value) return navigateTo('/login')

  // Signed-in players don't need the sign-in / sign-up screens.
  if (user.value && (to.path === '/login' || to.path === '/register')) return navigateTo('/lobby')
  if (user.value?.role === 'admin' && to.path === '/admin/login') return navigateTo('/admin')
})
