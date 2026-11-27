<script setup lang="ts">
import type { Room } from '~/types'

type FeedId = 'table' | 'operator'

const props = defineProps<{ room: Room }>()
const muted = ref(true)
const host = ref<HTMLElement | null>(null)
const table = computed(() => String(props.room.id).padStart(2, '0'))

/**
 * Two live feeds: the table camera (host stream, the coin toss) and the
 * operator camera (staff stream). One fills the player, the other sits in a
 * picture-in-picture window; clicking the small one swaps them. Both feeds stay
 * mounted and only change position, so a playing <video> never reconnects.
 */
const feeds = computed(() => [
  { id: 'table' as const, label: 'Table', live: props.room.stream_provider !== 'off', url: props.room.srs_whep_url },
  { id: 'operator' as const, label: 'Operator', live: props.room.staff_stream_provider !== 'off', url: props.room.staff_srs_whep_url },
])
const main = ref<FeedId>('table')
const pipHidden = ref(false)
const mainFeed = computed(() => feeds.value.find((f) => f.id === main.value)!)
const pipFeed = computed(() => feeds.value.find((f) => f.id !== main.value)!)
const anyLive = computed(() => feeds.value.some((f) => f.live))
const swap = () => (main.value = pipFeed.value.id)

const now = ref(Date.now())
const secondsLeft = computed(() =>
  props.room.status === 'open' && props.room.closes_at ? Math.max(0, Math.ceil((props.room.closes_at - now.value) / 1000)) : 0,
)
const clock = computed(() => `${String(Math.floor(secondsLeft.value / 60)).padStart(2, '0')}:${String(secondsLeft.value % 60).padStart(2, '0')}`)

/** The countdown only shows while betting is open; other states are carried by the status pill and standby note. */
const showCall = computed(() => props.room.status === 'open')

const standbyNote = computed(() => ({
  open: 'Betting is open. The table camera will appear here when it goes live.',
  closed: 'Betting is closed. Awaiting the host’s coin toss result.',
  waiting: 'The host will open betting shortly.',
  break: 'The table is taking a short break.',
}[props.room.status]))

const isFullscreen = ref(false)
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else host.value?.requestFullscreen?.()
}
const onFsChange = () => (isFullscreen.value = document.fullscreenElement === host.value)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000)
  document.addEventListener('fullscreenchange', onFsChange)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('fullscreenchange', onFsChange)
})
</script>

<template>
  <section ref="host" class="video-host" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="video-stage">
      <div class="video-top">
        <div>
          <span class="live-badge" :class="mainFeed.live ? 'is-live' : 'is-standby'">{{ mainFeed.live ? 'LIVE' : 'STANDBY' }}</span>
          <span class="video-glass video-cam-label">{{ mainFeed.label }} cam</span>
          <span class="video-glass" :title="`${room.players} betting this round`">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
            {{ room.players }}<span class="sr-only"> betting this round</span>
          </span>
        </div>
        <div>
          <span v-if="mainFeed.live" class="video-glass">HD</span>
          <button v-if="anyLive" type="button" class="video-glass" :aria-label="muted ? 'Unmute' : 'Mute'" :aria-pressed="!muted" @click="muted = !muted">
            <svg v-if="muted" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m22 9-6 6M16 9l6 6" /></svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>
          </button>
          <button type="button" class="video-glass" :aria-label="pipHidden ? `Show ${pipFeed.label.toLowerCase()} camera` : `Hide ${pipFeed.label.toLowerCase()} camera`" :aria-pressed="!pipHidden" :title="pipHidden ? 'Show picture-in-picture' : 'Hide picture-in-picture'" @click="pipHidden = !pipHidden">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><rect x="12" y="12" width="7" height="5" rx="1" :fill="pipHidden ? 'none' : 'currentColor'" /></svg>
          </button>
          <button type="button" class="video-glass" :aria-label="isFullscreen ? 'Exit full screen' : 'Full screen'" @click="toggleFullscreen">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          </button>
        </div>
      </div>

      <div
        v-for="f in feeds"
        :key="f.id"
        class="feed"
        :class="[`feed-${f.id}`, f.id === main ? 'is-main' : 'is-pip', { 'is-hidden': f.id !== main && pipHidden, 'is-live': f.live }]"
      >
        <!-- WHEP playback is wired up here when a stream URL is available: f.url -->
        <div v-if="f.live" class="feed-live">
          <span class="feed-spinner" aria-hidden="true" />
          <p>Connecting to {{ f.label.toLowerCase() }} camera…</p>
        </div>
        <p v-else class="standby-text">
          <template v-if="f.id === main">{{ f.id === 'table' ? standbyNote : 'The operator camera is off right now.' }}</template>
          <template v-else>Camera off</template>
        </p>

        <template v-if="f.id !== main">
          <span class="feed-tag" :class="f.live ? 'is-live' : 'is-standby'">{{ f.label }}<span class="sr-only">{{ f.live ? ', live' : ', standby' }}</span></span>
          <button type="button" class="feed-swap" :aria-label="`Swap: show the ${f.label.toLowerCase()} camera in the main view`" :title="`Show ${f.label.toLowerCase()} camera`" @click="swap">
            <span class="feed-swap-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4M3 8h13a4 4 0 0 1 4 4M17 20l4-4-4-4M21 16H8a4 4 0 0 1-4-4" /></svg>
            </span>
          </button>
        </template>
      </div>

      <div v-if="showCall" class="video-call" :class="{ urgent: secondsLeft <= 10 }" role="timer" aria-live="off">
        <small>Make your call in</small>
        <b>{{ clock }}</b>
      </div>
    </div>

    <div class="video-bar">
      <span class="signal">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="3" y="15" width="3.5" height="6" rx="1" /><rect x="8.5" y="11" width="3.5" height="10" rx="1" /><rect x="14" y="7" width="3.5" height="14" rx="1" /><rect x="19.5" y="3" width="3.5" height="18" rx="1" opacity=".45" /></svg>
        {{ mainFeed.live ? 'Live' : 'Standby' }}
      </span>
      <button v-if="anyLive" type="button" class="btn btn-ghost small" @click="muted = !muted">{{ muted ? 'Unmute' : 'Mute' }}</button>
      <button type="button" class="btn btn-ghost small" @click="swap">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4 3 8l4 4M3 8h13a4 4 0 0 1 4 4M17 20l4-4-4-4M21 16H8a4 4 0 0 1-4-4" /></svg>
        {{ pipFeed.label }} cam
      </button>
      <span class="spacer" />
      <span class="video-bar-item">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m8.8 12.2 2.2 2.2 4.2-4.4" /></svg>
        Host-confirmed result
      </span>
      <span class="sep" aria-hidden="true" />
      <span class="video-bar-item muted">kk / {{ table }}</span>
    </div>
  </section>
</template>
