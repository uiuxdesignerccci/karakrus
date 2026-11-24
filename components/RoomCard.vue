<script setup lang="ts">
import type { Room } from '~/types'

const props = defineProps<{ room: Room }>()

const table = computed(() => String(props.room.id).padStart(2, '0'))
const pool = computed(() => props.room.pool_kara + props.room.pool_krus)
const variant = computed(() => (props.room.id % 3 === 0 ? 'kara' : props.room.id % 3 === 1 ? 'both' : 'krus'))
</script>

<template>
  <NuxtLink :to="`/rooms/${room.id}`" class="room-card">
    <div class="room-art" :class="`art-${variant}`">
      <StatusPill :status="room.status" />
      <span class="room-table">TABLE / {{ table }}</span>
      <div class="room-coins">
        <CoinFace v-if="variant !== 'krus'" side="kara" :size="110" />
        <CoinFace v-if="variant !== 'kara'" side="krus" :size="110" />
      </div>
      <span class="room-tag">{{ room.name === 'The High Table' ? 'THE ORIGINAL EXPERIENCE' : 'WHEN THE NIGHT COMES ALIVE' }}</span>
    </div>
    <div class="room-body">
      <div class="room-title">
        <h3>{{ room.name }}</h3>
      </div>
      <p class="muted">{{ room.subtitle }}</p>
      <div class="room-meta">
        <span>{{ room.players }} betting</span>
        <span>{{ formatCredits(room.min_bet) }} CR min.</span>
      </div>
      <div class="room-pool">
        <small>ROUND POOL</small>
        <b>{{ formatCredits(pool) }} CR</b>
      </div>
      <span class="btn btn-ghost room-enter">Enter room</span>
    </div>
  </NuxtLink>
</template>
