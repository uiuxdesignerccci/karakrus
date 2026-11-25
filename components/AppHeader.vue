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
          <button type="button" class="icon-btn desktop-only" aria-label="Sign out" @click="logout">⎋</button>
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
