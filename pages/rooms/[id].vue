<script setup lang="ts">
import type { Bet, Room, Side } from '~/types'

const route = useRoute()
const { user, fetchUser } = useAuth()
const { show: showHowToPlay } = useHowToPlay()
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
// The room fills the screen below the sticky header; keep --header-h in step with its real height.
let headerObserver: ResizeObserver | undefined
onMounted(() => {
  timer = setInterval(refresh, 3000)
  const header = document.querySelector<HTMLElement>('.site-header')
  if (header) {
    headerObserver = new ResizeObserver(() => document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`))
    headerObserver.observe(header)
  }
})
onBeforeUnmount(() => {
  clearInterval(timer)
  headerObserver?.disconnect()
})

useHead(() => ({ title: `${room.value.name} · Kara Krus` }))
</script>

<template>
  <div class="page room-page">
    <div class="room-shell" :class="{ 'is-guest': !user }">
      <section class="stage-card" aria-label="Table">
        <header class="stage-top">
          <RoomTablePicker :room="room" />
          <span class="round-chip">Round {{ String(room.round_number).padStart(3, '0') }}</span>
          <span class="spacer" />
          <StatusPill :status="room.status" />
          <button type="button" class="stage-icon-btn" aria-label="How to play" title="How to play" @click="showHowToPlay">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9.6 9.2a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17h.01" /></svg>
          </button>
        </header>

        <div v-if="room.final" class="banner">Final round</div>

        <div class="stage-body">
          <div class="stage-main">
            <RoomVideo v-if="user" :room="room" />
            <RoomSignInGate v-else />
            <RoomRecentFlips :history="room.history" strip />
          </div>
          <div class="stage-slip">
            <RoomBetPanel :room="room" :balance="user?.balance ?? 0" :placing="placing" :guest="!user" @place="place" />
            <p v-if="betError" class="form-error" role="alert">{{ betError }}</p>
          </div>
        </div>
      </section>

      <aside v-if="user" class="room-rail" aria-label="Table activity">
        <RoomBetsList :bets="bets" />
        <RoomChat :room-id="room.id" :username="user.username" />
      </aside>
    </div>

    <RoomInfoBar :room="room" />
  </div>
</template>
