<script setup lang="ts">
import type { Room, Side } from '~/types'

const props = defineProps<{ room: Room; balance: number; placing?: boolean; guest?: boolean }>()
const route = useRoute()
const emit = defineEmits<{ place: [side: Side, amountCr: number] }>()

const side = ref<Side>('kara')
const amount = ref<number>(props.room.min_bet / 100)

const minCr = computed(() => props.room.min_bet / 100)
const maxCr = computed(() => props.room.max_bet / 100)
const pool = computed(() => props.room.pool_kara + props.room.pool_krus)
const canBet = computed(() => !props.guest && props.room.status === 'open' && !props.placing)
const estimate = computed(() => estimateReturn(props.room, side.value, Math.round((amount.value || 0) * 100)))
const invalid = computed(() => !Number.isFinite(amount.value) || amount.value < minCr.value || amount.value > maxCr.value)

/** Three round quick amounts spread across the table's bet range (Max covers the top). */
const quick = computed(() => {
  const nice = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000]
  const fits = nice.filter((v) => v >= minCr.value && v < maxCr.value)
  if (fits.length <= 3) return fits
  return [fits[0], fits[Math.floor(fits.length / 2)], fits[fits.length - 1]]
})
const clamp = (v: number) => Math.min(maxCr.value, Math.max(minCr.value, v))
const step = (dir: 1 | -1) => (amount.value = clamp((Number.isFinite(amount.value) ? amount.value : minCr.value) + dir * minCr.value))
const setMax = () => (amount.value = Math.max(minCr.value, Math.min(maxCr.value, Math.floor(props.balance / 100))))

const cta = computed(() => {
  if (canBet.value) return `Place bet on ${SIDE_LABEL[side.value].toUpperCase()}`
  if (props.placing) return 'Placing bet…'
  return { closed: 'Betting closed', waiting: 'Waiting for the next round', break: 'On a break', open: 'Betting open' }[props.room.status]
})
</script>

<template>
  <section class="bet-panel" aria-label="Bet slip">
    <div class="pool-row">
      <span class="pool-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" /></svg>
      </span>
      <span>Total round pool</span>
      <b>{{ formatCredits(pool) }} <small>CR</small></b>
    </div>

    <div class="sides" role="radiogroup" aria-label="Choose a side">
      <button
        v-for="s in (['kara', 'krus'] as const)"
        :key="s"
        type="button"
        role="radio"
        :aria-checked="side === s"
        class="side"
        :class="[`side-${s}`, { selected: side === s }]"
        @click="side = s"
      >
        <CoinFace :side="s" :size="60" />
        <strong>{{ SIDE_LABEL[s].toUpperCase() }}</strong>
        <small>{{ formatCredits(s === 'kara' ? room.pool_kara : room.pool_krus) }} CR</small>
      </button>
    </div>

    <div class="bet-label"><span>Your bet</span><span class="muted">{{ minCr.toLocaleString('en-US') }} – {{ maxCr.toLocaleString('en-US') }} CR</span></div>
    <div class="stepper">
      <button type="button" aria-label="Decrease bet" :disabled="!canBet || amount <= minCr" @click="step(-1)">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
      </button>
      <label class="amount">
        <input v-model.number="amount" type="number" inputmode="numeric" :min="minCr" :max="maxCr" :step="minCr" :disabled="!canBet" aria-label="Bet amount in credits">
        <span>CR</span>
      </label>
      <button type="button" aria-label="Increase bet" :disabled="!canBet || amount >= maxCr" @click="step(1)">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
    <div class="quick">
      <button v-for="q in quick" :key="q" type="button" :class="{ active: amount === q }" :disabled="!canBet" @click="amount = q">{{ q.toLocaleString('en-US') }}</button>
      <button type="button" :disabled="!canBet" @click="setMax">Max</button>
    </div>

    <div class="estimate">
      <span>
        Estimated side return
        <span class="info-tip" tabindex="0" role="img" aria-label="Your share if this side wins: (your bets ÷ side pool) × total pool × 0.95" title="Your share if this side wins: (your bets ÷ side pool) × total pool × 0.95">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
        </span>
      </span>
      <b>{{ formatCredits(estimate) }} CR</b>
    </div>
    <p class="fine">Includes your current {{ side }} bets and this new bet. Changes with the pool. 5% fee included.</p>

    <NuxtLink v-if="guest" :to="{ path: '/login', query: { redirect: route.fullPath } }" class="btn btn-gold wide">Sign in to bet</NuxtLink>
    <button v-else type="button" class="btn btn-gold wide" :disabled="!canBet || invalid" @click="emit('place', side, amount)">
      <svg v-if="canBet" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5v15l12-7.5-12-7.5Z" /></svg>
      {{ cta }}
    </button>
  </section>
</template>
