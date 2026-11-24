<script setup lang="ts">
const { user, logout } = useAuth()
const { show } = useHowToPlay()
const route = useRoute()

const links = [
  { to: '/', label: 'Discover' },
  { to: '/lobby', label: 'Live lobby', live: true },
  { to: '/invitations', label: 'Invitations' },
]

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const initial = computed(() => user.value?.firstName?.[0]?.toUpperCase() ?? '?')
</script>

<template>
  <header class="site-header">
    <div class="site-header-inner">
      <BrandLogo />
      <nav class="site-nav" aria-label="Primary">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" :class="{ active: isActive(l.to) }">
          {{ l.label }}<i v-if="l.live" class="live-dot" aria-hidden="true" />
        </NuxtLink>
        <button type="button" class="nav-btn" @click="show">How to play</button>
      </nav>
      <div class="site-actions">
        <template v-if="user">
          <span class="wallet" title="Demo balance"><b>{{ formatCredits(user.balance) }}</b> <small>CR</small></span>
          <span class="avatar" :title="`${user.firstName} ${user.lastName}`">{{ initial }}</span>
          <ThemeToggle />
          <button type="button" class="icon-btn" aria-label="Sign out" @click="logout">⎋</button>
        </template>
        <template v-else>
          <ThemeToggle />
          <NuxtLink to="/login" class="btn btn-gold">Sign in</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>
