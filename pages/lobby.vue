<script setup lang="ts">
import type { Room } from '~/types'

const { user } = useAuth()

const { data, refresh } = await useFetch<{ rooms: Room[] }>('/api/rooms', {
  headers: useRequestHeaders(['cookie']),
  default: () => ({ rooms: [] }),
})
const rooms = computed(() => data.value?.rooms ?? [])

type Tab = 'all' | 'open' | 'between'
const tab = ref<Tab>('all')
const query = ref('')

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All tables' },
  { key: 'open', label: 'Betting open' },
  { key: 'between', label: 'Between rounds' },
]

const filtered = computed(() =>
  rooms.value.filter((r) => {
    if (tab.value === 'open' && r.status !== 'open') return false
    if (tab.value === 'between' && r.status !== 'break' && r.status !== 'waiting') return false
    const q = query.value.trim().toLowerCase()
    return !q || r.name.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
  }),
)

const takingBets = computed(() => rooms.value.filter((r) => r.status === 'open').length)
const participants = computed(() => rooms.value.reduce((n, r) => n + r.players, 0))
const inPlay = computed(() => rooms.value.reduce((n, r) => n + r.pool_kara + r.pool_krus, 0))

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => (timer = setInterval(refresh, 5000)))
onBeforeUnmount(() => clearInterval(timer))

useHead({ title: 'Lobby · Kara Krus' })
</script>

<template>
  <div class="page">
    <p class="eyebrow">THE LIVE LOBBY</p>
    <h1 class="page-title">Your table awaits, {{ user?.firstName }}.</h1>
    <p class="muted">A table for every mood. Choose your seat and make your call.</p>

    <div class="stat-bar">
      <div><span aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2" /></svg></span><b>{{ takingBets }}</b><small>Taking bets</small></div>
      <div><span aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></svg></span><b>{{ participants }}</b><small>Round participants</small></div>
      <div><span aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="9" cy="7" rx="6" ry="3" /><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" /><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3" /></svg></span><b>{{ formatCredits(inPlay) }}</b><small>Credits in play</small></div>
    </div>

    <div class="toolbar">
      <div class="tabs" role="tablist">
        <button v-for="t in tabs" :key="t.key" type="button" role="tab" :aria-selected="tab === t.key" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </div>
      <input v-model="query" type="search" class="search" placeholder="Search for a table…" aria-label="Search for a table">
    </div>

    <div v-if="filtered.length" class="room-grid">
      <RoomCard v-for="r in filtered" :key="r.id" :room="r" />
    </div>
    <p v-else class="muted empty">No tables match right now.</p>
  </div>
</template>
