<script setup lang="ts">
const { user, logout } = useAuth()
const { show } = useHowToPlay()
const route = useRoute()

const links = computed(() => [
  ...(user.value ? [] : [{ to: '/', label: 'Discover' }]),
  { to: '/lobby', label: 'Lobby' },
  { to: '/invitations', label: 'Invitations' },
])

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const initial = computed(() => user.value?.firstName?.[0]?.toUpperCase() ?? '?')

const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false })
const openHowToPlay = () => { menuOpen.value = false; show() }
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') menuOpen.value = false }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <header class="site-header" :class="{ 'menu-open': menuOpen }">
    <div class="site-header-inner">
      <BrandLogo />
      <nav id="site-nav" class="site-nav" aria-label="Primary">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" :class="{ active: isActive(l.to) }">
          {{ l.label }}
        </NuxtLink>
        <button type="button" class="nav-btn" @click="openHowToPlay">How to play</button>
        <div class="mobile-nav-foot">
          <ThemeToggle />
          <button v-if="user" type="button" class="nav-btn" @click="logout">Sign out</button>
        </div>
      </nav>
      <div class="site-actions">
        <template v-if="user">
          <span class="wallet" title="Demo balance"><b>{{ formatCredits(user.balance) }}</b> <small>CR</small></span>
          <NuxtLink to="/profile" class="avatar" :class="{ active: route.path === '/profile' }" :title="`${user.firstName} ${user.lastName} · Profile`" aria-label="Your profile">{{ initial }}</NuxtLink>
          <ThemeToggle class="desktop-only" />
          <button type="button" class="signout-btn desktop-only" aria-label="Sign out" title="Sign out" @click="logout">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>
          </button>
        </template>
        <template v-else>
          <ThemeToggle class="desktop-only" />
          <NuxtLink to="/login" class="btn btn-gold">Sign in</NuxtLink>
        </template>
        <button
          type="button"
          class="menu-toggle"
          aria-controls="site-nav"
          :aria-expanded="menuOpen"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <span aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>
</template>
