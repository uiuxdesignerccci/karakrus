<script setup lang="ts">
import type { Room } from '~/types'

const props = defineProps<{ room: Room }>()
const { show } = useHowToPlay()

type Tab = 'info' | 'rules'
const openTab = ref<Tab | null>(null)
const toggle = (t: Tab) => (openTab.value = openTab.value === t ? null : t)
const panelId = useId()

const info = computed(() => [
  { label: 'Table', value: `${String(props.room.id).padStart(2, '0')} · ${props.room.name}` },
  { label: 'Round', value: `#${String(props.room.round_number).padStart(3, '0')}` },
  { label: 'Status', value: STATUS_LABEL[props.room.status] },
  { label: 'Betting window', value: `${props.room.duration} seconds` },
  { label: 'Bet range', value: `${formatCredits(props.room.min_bet)} – ${formatCredits(props.room.max_bet)} CR` },
  { label: 'Room type', value: props.room.visibility === 'vip' ? 'VIP · invitation only' : 'Public' },
  { label: 'Betting this round', value: String(props.room.players) },
  { label: 'House fee', value: `${FEE_RATE * 100}% of the pool` },
])
</script>

<template>
  <section class="room-info">
    <div class="room-info-tabs">
      <button type="button" class="room-info-tab" :aria-expanded="openTab === 'info'" :aria-controls="panelId" @click="toggle('info')">
        <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg></span>
        Game info
        <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <button type="button" class="room-info-tab" :aria-expanded="openTab === 'rules'" :aria-controls="panelId" @click="toggle('rules')">
        <span class="ico tone-orange" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10.5 5 8 4.5 3 4.5v14c5 0 7.5.5 9 2 1.5-1.5 4-2 9-2v-14c-5 0-7.5.5-9 2ZM12 6.5v14" /></svg></span>
        Rules &amp; payouts
        <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </div>

    <div v-if="openTab" :id="panelId" class="room-info-panel">
      <dl v-if="openTab === 'info'" class="room-info-grid">
        <div v-for="i in info" :key="i.label"><dt>{{ i.label }}</dt><dd>{{ i.value }}</dd></div>
      </dl>
      <div v-else class="room-rules">
        <ol class="rules">
          <li>Wait for the host to open betting.</li>
          <li>Choose Kara or Krus and place credits before the countdown ends. You can place multiple bets on either side.</li>
          <li>Betting closes automatically. The host tosses a single coin and confirms its result.</li>
          <li>The winning side shares 95% of the total pool, in proportion to each bet. If nobody bet on the winning side, all bets are refunded.</li>
        </ol>
        <div class="room-rules-side">
          <p class="formula">Your return = (your bet ÷ winning-side pool)<br>× (total pool × 0.95)</p>
          <p class="muted">Example: a 100 CR winning bet in a 500 CR winning pool, with 1,000 CR total, returns 190 CR including your stake.</p>
          <button type="button" class="btn btn-ghost small" @click="show">Full how-to-play guide</button>
        </div>
      </div>
    </div>
  </section>
</template>
