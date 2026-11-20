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
  { key: 'all', label: 'All rooms' },
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

useHead({ title: 'Live lobby · Kara Krus' })
</script>

<template>
  <div class="page">
    <p class="eyebrow">THE LIVE LOBBY</p>
    <h1 class="page-title">Your table awaits, {{ user?.firstName }}.</h1>
    <p class="muted">A room for every mood. Choose your seat and make your call.</p>

    <div class="stat-bar">
      <div><span aria-hidden="true">((•))</span><b>{{ takingBets }}</b><small>Taking bets</small></div>
      <div><span aria-hidden="true">⚇</span><b>{{ participants }}</b><small>Round participants</small></div>
      <div><span aria-hidden="true">◎</span><b>{{ formatCredits(inPlay) }}</b><small>Credits in play</small></div>
    </div>

    <div class="toolbar">
      <div class="tabs" role="tablist">
        <button v-for="t in tabs" :key="t.key" type="button" role="tab" :aria-selected="tab === t.key" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </div>
      <input v-model="query" type="search" class="search" placeholder="Search for a room…" aria-label="Search for a room">
    </div>

    <div v-if="filtered.length" class="room-grid">
      <RoomCard v-for="r in filtered" :key="r.id" :room="r" />
    </div>
    <p v-else class="muted empty">No rooms match right now.</p>
  </div>
</template>
