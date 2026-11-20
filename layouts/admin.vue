<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()
const menuOpen = ref(false)

const links = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/rooms', label: 'Rooms' },
  { to: '/admin/settings', label: 'Settings' },
]
const isActive = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))

watch(() => route.path, () => (menuOpen.value = false))
</script>

<template>
  <div class="admin" :class="{ 'menu-open': menuOpen }">
    <aside class="admin-side">
      <BrandLogo />
      <p class="admin-side-label">CONTROL ROOM</p>
      <nav aria-label="Admin">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" :class="{ active: isActive(l.to) }">{{ l.label }}</NuxtLink>
      </nav>
      <div class="admin-side-foot">
        <NuxtLink to="/">Open player portal</NuxtLink>
        <button type="button" @click="logout">Sign out{{ user ? ` (${user.username})` : '' }}</button>
      </div>
    </aside>
    <div class="admin-body">
      <header class="admin-top">
        <button type="button" class="icon-btn admin-burger" aria-label="Menu" @click="menuOpen = !menuOpen">☰</button>
        <strong>{{ $route.meta.adminTitle ?? 'Admin console' }}</strong>
        <span class="admin-badge">Admin console <b>HOST</b></span>
      </header>
      <main class="admin-main"><slot /></main>
    </div>
  </div>
</template>
