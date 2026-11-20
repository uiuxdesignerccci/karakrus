<script setup lang="ts">
import type { Room } from '~/types'

const props = defineProps<{ room: Room }>()
const muted = ref(true)
const table = computed(() => String(props.room.id).padStart(2, '0'))
const hasHost = computed(() => props.room.stream_provider !== 'off')
const hasStaff = computed(() => props.room.staff_stream_provider !== 'off')
</script>

<template>
  <div class="video-wrap">
    <section class="video-host">
      <div class="video-stage">
        <span class="chip">{{ hasHost ? 'HOST VIDEO' : 'STREAM STANDBY' }}</span>
        <template v-if="hasHost">
          <!-- WHEP playback is wired up here when a stream URL is available: room.srs_whep_url -->
          <p class="video-note">Connecting to live video…</p>
        </template>
        <div v-else class="video-standby">
          <CoinFace side="kara" :size="72" />
          <h3>The table is getting ready.</h3>
          <p class="muted">Betting is closed. Awaiting the host’s coin toss result.</p>
        </div>
      </div>
      <div class="video-bar">
        <span class="muted">LIVE</span>
        <button v-if="hasHost" type="button" class="btn btn-ghost small" @click="muted = !muted">{{ muted ? 'Unmute' : 'Mute' }}</button>
        <span class="muted">kk / {{ table }}</span>
      </div>
    </section>
    <section v-if="hasStaff" class="video-staff">
      <span class="chip">STAFF</span>
      <p class="video-note">Connecting to staff video…</p>
    </section>
  </div>
</template>
