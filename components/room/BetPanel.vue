<script setup lang="ts">
import type { Room, Side } from '~/types'

const props = defineProps<{ room: Room; balance: number; placing?: boolean }>()
const emit = defineEmits<{ place: [side: Side, amountCr: number] }>()

const side = ref<Side>('kara')
const amount = ref<number>(props.room.min_bet / 100)

const minCr = computed(() => props.room.min_bet / 100)
const maxCr = computed(() => props.room.max_bet / 100)
const pool = computed(() => props.room.pool_kara + props.room.pool_krus)
const canBet = computed(() => props.room.status === 'open' && !props.placing)
const estimate = computed(() => estimateReturn(props.room, side.value, Math.round(amount.value * 100)))
const invalid = computed(() => !Number.isFinite(amount.value) || amount.value < minCr.value || amount.value > maxCr.value)

const quick = [10, 50, 100]
const setMax = () => (amount.value = Math.min(maxCr.value, props.balance / 100))

const header = computed(() => ({
  waiting: 'Waiting for host',
  open: 'Betting open',
  closed: 'Awaiting toss',
  break: 'On a break',
}[props.room.status]))

const cta = computed(() => (canBet.value ? `Bet ${amount.value} CR on ${SIDE_LABEL[side.value]}` : props.room.status === 'closed' ? 'Betting closed' : 'Waiting for the next round'))
</script>

<template>
  <aside class="bet-panel">
    <p class="eyebrow center">{{ room.status === 'closed' ? 'BETTING CLOSED' : 'NEXT MOMENT' }}</p>
    <h2 class="bet-state">{{ header }}</h2>

    <div class="pool-row"><span>Total round pool</span><b>{{ formatCredits(pool) }} <small>CR</small></b></div>

    <div class="sides">
      <button v-for="s in (['kara', 'krus'] as const)" :key="s" type="button" class="side" :class="[`side-${s}`, { selected: side === s }]" @click="side = s">
        <CoinFace :side="s" :size="64" />
        <strong>{{ SIDE_LABEL[s].toUpperCase() }}</strong>
        <small>{{ formatCredits(s === 'kara' ? room.pool_kara : room.pool_krus) }} CR</small>
      </button>
    </div>

    <div class="bet-label"><span>Your bet</span><span class="muted">{{ minCr }}–{{ maxCr.toLocaleString('en-US') }} CR</span></div>
    <label class="amount">
      <input v-model.number="amount" type="number" inputmode="numeric" :min="minCr" :max="maxCr" :disabled="!canBet">
      <span>CR</span>
    </label>
    <div class="quick">
      <button v-for="q in quick" :key="q" type="button" :disabled="!canBet" @click="amount = q">{{ q }}</button>
      <button type="button" :disabled="!canBet" @click="setMax">Max</button>
    </div>

    <div class="estimate">
      <span>Estimated side return</span>
      <b>{{ formatCredits(estimate) }} CR</b>
    </div>
    <p class="fine">Includes your current {{ side }} bets and this new bet. Changes with the pool. 5% fee included.</p>

    <button type="button" class="btn btn-gold wide" :disabled="!canBet || invalid" @click="emit('place', side, amount)">
      {{ cta }} <span aria-hidden="true">↗</span>
    </button>
    <p class="fine center">Demo balance: {{ formatCredits(balance) }} CR</p>
  </aside>
</template>
