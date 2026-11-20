<script setup lang="ts">
import type { RoundResult } from '~/types'

defineProps<{ history: RoundResult[] }>()
</script>

<template>
  <section class="card">
    <header class="card-head"><h3>Recent flips</h3><small class="muted">LAST {{ history.length }} ROUNDS</small></header>
    <p v-if="!history.length" class="muted">The story starts with the first flip.</p>
    <ul v-else class="flips">
      <li v-for="h in history" :key="h.round" :class="`flip-${h.result}`" :title="`Round ${h.round}: ${h.result}`">
        <CoinFace :side="h.result" :size="32" />
      </li>
    </ul>
  </section>
</template>
