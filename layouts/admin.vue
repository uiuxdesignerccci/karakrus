<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()
const menuOpen = ref(false)

/** Sidebar entries; `icon` is the inner markup of a 24×24 stroke icon. */
const links = [
  { to: '/admin', label: 'Overview', icon: '<rect x="3.5" y="3.5" width="7" height="8" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.5"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.5"/><rect x="3.5" y="14.5" width="7" height="6" rx="1.5"/>' },
  { to: '/admin/rooms', label: 'Rooms', icon: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/><path d="m10.5 8.5 4 2-4 2z" fill="currentColor"/>' },
  { to: '/admin/players', label: 'Players', icon: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>' },
  { to: '/admin/staff', label: 'Staff', icon: '<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><circle cx="12" cy="10" r="2.8"/><path d="M7.5 17a4.5 4.5 0 0 1 9 0"/>' },
  { to: '/admin/roles', label: 'Roles', icon: '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m8.8 12.2 2.2 2.2 4.2-4.4"/>' },
  { to: '/admin/audit', label: 'Audit Trail', icon: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.8h6V4M8.5 10h7M8.5 13.5h7M8.5 17h4"/>' },
  { to: '/admin/sessions', label: 'Sessions', icon: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>' },
  { to: '/admin/settings', label: 'Settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>' },
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
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" :class="{ active: isActive(l.to) }">
          <!-- eslint-disable-next-line vue/no-v-html -- static icon markup defined above -->
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="l.icon" />
          <span>{{ l.label }}</span>
        </NuxtLink>
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
        <ThemeToggle />
      </header>
      <main class="admin-main"><slot /></main>
    </div>
  </div>
</template>
