<script setup lang="ts">
import type { Bet, Room, Side } from '~/types'

const route = useRoute()
const { user, fetchUser } = useAuth()
const id = computed(() => Number(route.params.id))

const { data, refresh, error } = await useFetch<{ room: Room; bets: Bet[] }>(() => `/api/rooms/${id.value}`, {
  headers: useRequestHeaders(['cookie']),
})
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Room not found', fatal: true })

const room = computed(() => data.value!.room)
const bets = computed(() => data.value?.bets ?? [])

const placing = ref(false)
const betError = ref('')

async function place(side: Side, amount: number) {
  placing.value = true
  betError.value = ''
  try {
    await $fetch(`/api/rooms/${id.value}/bets`, { method: 'POST', body: { side, amount } })
    await Promise.all([refresh(), fetchUser()])
  } catch (e) {
    betError.value = (e as { statusMessage?: string }).statusMessage ?? 'Could not place bet'
  } finally {
    placing.value = false
  }
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => (timer = setInterval(refresh, 3000)))
onBeforeUnmount(() => clearInterval(timer))

useHead(() => ({ title: `${room.value.name} · Kara Krus` }))
</script>

<template>
  <div class="page room-page">
    <nav class="crumbs" aria-label="Breadcrumb"><NuxtLink :to="user ? '/lobby' : '/'">{{ user ? 'Lobby' : 'Home' }}</NuxtLink><span>/</span><span>{{ room.name }}</span></nav>

    <header class="room-head">
      <div>
        <p class="eyebrow">TABLE {{ String(room.id).padStart(2, '0') }} · ROUND {{ String(room.round_number).padStart(3, '0') }}</p>
        <h1 class="page-title">{{ room.name }}</h1>
      </div>
      <StatusPill :status="room.status" />
    </header>

    <div v-if="room.final" class="banner">Final round</div>

    <div class="room-layout">
      <div class="room-main">
        <RoomVideo v-if="user" :room="room" />
        <RoomSignInGate v-else />
        <div class="room-sub">
          <span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></svg> {{ room.players }} betting this round</span>
          <span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m8.8 12.2 2.2 2.2 4.2-4.4" /></svg> Host-confirmed result</span>
        </div>
        <RoomChat v-if="user" :room-id="room.id" :username="user.username" />
        <RoomRecentFlips v-else :history="room.history" />
      </div>
      <div class="room-side">
        <RoomBetPanel :room="room" :balance="user?.balance ?? 0" :placing="placing" :guest="!user" @place="place" />
        <p v-if="betError" class="form-error" role="alert">{{ betError }}</p>
        <template v-if="user">
          <RoomRecentFlips :history="room.history" />
          <RoomBetsList :bets="bets" />
        </template>
      </div>
    </div>

  </div>
</template>
