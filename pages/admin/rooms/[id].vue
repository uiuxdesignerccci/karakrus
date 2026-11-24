<script setup lang="ts">
import type { Room, RoundAction, Side, StreamProvider } from '~/types'

definePageMeta({ layout: 'admin', adminTitle: 'Game room' })

const route = useRoute()
const id = computed(() => Number(route.params.id))
const { user } = useAuth()

const { data, refresh, error } = await useFetch<{ room: Room }>(() => `/api/rooms/${id.value}`, { headers: useRequestHeaders(['cookie']) })
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Room not found', fatal: true })
const room = computed(() => data.value!.room)

const showSettings = ref(false)
const actionError = ref('')
const busy = ref(false)
const confirmSide = ref<Side>('kara')

const host = reactive({ provider: room.value.stream_provider as StreamProvider, url: room.value.srs_whep_url })
const staff = reactive({ provider: room.value.staff_stream_provider as StreamProvider, url: room.value.staff_srs_whep_url })
const streamMsg = ref('')

const now = ref(Date.now())
const countdown = computed(() => {
  const s = room.value.status === 'open' && room.value.closes_at ? Math.max(0, Math.ceil((room.value.closes_at - now.value) / 1000)) : 0
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

async function run(action: RoundAction, result?: Side) {
  busy.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/admin/rooms/${id.value}/action`, { method: 'POST', body: { action, result } })
    await refresh()
  } catch (e) {
    actionError.value = (e as { statusMessage?: string }).statusMessage ?? 'Action failed'
  } finally {
    busy.value = false
  }
}

async function saveStreaming(kind: 'host' | 'staff') {
  streamMsg.value = ''
  const s = kind === 'host' ? host : staff
  try {
    await $fetch(`/api/admin/rooms/${id.value}/streaming`, { method: 'PUT', body: { kind, provider: s.provider, url: s.url } })
    await refresh()
    streamMsg.value = 'Saved.'
  } catch (e) {
    streamMsg.value = (e as { statusMessage?: string }).statusMessage ?? 'Could not save'
  }
}

let poll: ReturnType<typeof setInterval> | undefined
let tick: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  poll = setInterval(refresh, 3000)
  tick = setInterval(() => (now.value = Date.now()), 500)
})
onBeforeUnmount(() => {
  clearInterval(poll)
  clearInterval(tick)
})

useHead(() => ({ title: `${room.value.name} · Kara Krus Admin` }))
</script>

<template>
  <div class="room-page">
    <nav class="crumbs" aria-label="Breadcrumb"><NuxtLink to="/admin/rooms">Rooms</NuxtLink><span>/</span><span>{{ room.name }}</span></nav>

    <header class="room-head">
      <div>
        <p class="eyebrow">TABLE {{ String(room.id).padStart(2, '0') }} · ROUND {{ String(room.round_number).padStart(3, '0') }}</p>
        <h1 class="page-title">{{ room.name }}</h1>
        <p class="muted">{{ room.subtitle }}</p>
      </div>
      <button type="button" class="btn btn-ghost" @click="showSettings = true">Room settings</button>
    </header>

    <div class="room-layout admin-room-layout">
      <div class="room-main">
        <RoomVideo :room="room" />
        <RoomChat :room-id="room.id" :username="user?.username ?? ''" />
      </div>

      <div class="host-side">
        <aside class="host-panel">
          <header class="host-head"><h3>Host controls</h3><StatusPill :status="room.status" /></header>
          <div class="host-countdown">
            <p class="eyebrow">BETTING COUNTDOWN</p>
            <p class="countdown">{{ countdown }}</p>
            <p class="fine center">{{ room.duration }}-second rounds · Auto-closes at zero</p>
          </div>
          <div class="host-stats">
            <div><small>Participants</small><b>{{ room.players }}</b></div>
            <div><small>Total pool</small><b>{{ formatCredits(room.pool_kara + room.pool_krus) }} CR</b></div>
          </div>

          <template v-if="room.status === 'closed'">
            <p class="muted">Confirm the coin’s actual face to settle the pool.</p>
            <div class="sides">
              <button v-for="s in (['kara', 'krus'] as const)" :key="s" type="button" class="side" :class="[`side-${s}`, { selected: confirmSide === s }]" @click="confirmSide = s">
                <CoinFace :side="s" :size="48" /><strong>{{ SIDE_LABEL[s].toUpperCase() }}</strong>
              </button>
            </div>
            <button type="button" class="btn btn-gold wide" :disabled="busy" @click="run('result', confirmSide)">Confirm {{ SIDE_LABEL[confirmSide] }} result</button>
          </template>
          <template v-else-if="room.status === 'open'">
            <p class="muted">Betting is open. It closes automatically at zero.</p>
          </template>
          <template v-else>
            <button type="button" class="btn btn-gold wide" :disabled="busy" @click="run('start')">Resume with a new round</button>
            <div class="host-row">
              <button type="button" class="btn btn-ghost" :disabled="busy" @click="run('break')">Take a break</button>
              <button type="button" class="btn btn-ghost" :disabled="busy" @click="run('final')">Final round</button>
            </div>
          </template>
          <p v-if="actionError" class="form-error" role="alert">{{ actionError }}</p>
          <p class="fine">One coin decides the round. Confirm its actual face to settle the pool. All actions are recorded.</p>
        </aside>

        <div class="sides">
          <div class="card pool-card side-kara"><CoinFace side="kara" :size="40" /><small>KARA POOL</small><b>{{ formatCredits(room.pool_kara) }} CR</b></div>
          <div class="card pool-card side-krus"><CoinFace side="krus" :size="40" /><small>KRUS POOL</small><b>{{ formatCredits(room.pool_krus) }} CR</b></div>
        </div>

        <RoomRecentFlips :history="room.history" />

        <section class="card">
          <header class="card-head"><h3>Muted players (0)</h3></header>
          <p class="muted">No muted players.</p>
        </section>
      </div>
    </div>

    <div class="admin-stream-grid">
      <section class="card">
        <header class="card-head"><h3>Coin-toss streaming</h3><small class="muted">CHANGE ANYTIME</small></header>
        <form class="form" @submit.prevent="saveStreaming('host')">
          <label>Active source
            <select v-model="host.provider"><option value="srs">SRS · Live only</option><option value="off">Off</option></select>
          </label>
          <label>SRS WebRTC playback URL<input v-model="host.url" type="url" placeholder="https://…/rtc/v1/whep/?app=live&stream=…"></label>
          <p class="fine">Live video uses the WHEP playback URL. Choosing Off retains the URL. Never enter a publishing key here. Saving restarts playback when the source changes.</p>
          <button type="submit" class="btn btn-ghost">Save streaming settings</button>
        </form>
      </section>

      <section class="card">
        <header class="card-head"><h3>Staff streaming</h3><small class="muted">LIVE ONLY</small></header>
        <form class="form" @submit.prevent="saveStreaming('staff')">
          <label>Staff source
            <select v-model="staff.provider"><option value="srs">SRS · Live only</option><option value="off">Off</option></select>
          </label>
          <label>Staff SRS WebRTC playback URL<input v-model="staff.url" type="url"></label>
          <p class="fine">Staff video plays live beside the coin toss, without pause or rewind. Off hides the panel and keeps this URL configured. Enter a playback URL, never a publishing key.</p>
          <button type="submit" class="btn btn-ghost">Save staff streaming settings</button>
        </form>
      </section>
    </div>
    <p v-if="streamMsg" class="muted" role="status">{{ streamMsg }}</p>

    <AdminRoomForm v-if="showSettings" :room="room" @close="showSettings = false" @saved="showSettings = false; refresh()" />
  </div>
</template>
