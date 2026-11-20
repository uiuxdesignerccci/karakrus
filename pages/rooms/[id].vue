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
    <nav class="crumbs" aria-label="Breadcrumb"><NuxtLink to="/lobby">Lobby</NuxtLink><span>/</span><span>{{ room.name }}</span></nav>

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
        <RoomVideo :room="room" />
        <div class="room-sub">
          <span>⚇ {{ room.players }} betting this round</span>
          <span>⛨ Host-confirmed result</span>
        </div>
        <RoomRecentFlips :history="room.history" />
      </div>
      <div class="room-side">
        <RoomBetPanel :room="room" :balance="user?.balance ?? 0" :placing="placing" @place="place" />
        <p v-if="betError" class="form-error" role="alert">{{ betError }}</p>
      </div>
    </div>

    <RoomBetsList :bets="bets" />
    <RoomChat :room-id="room.id" :username="user?.username ?? ''" />
  </div>
</template>
