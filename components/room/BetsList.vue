<script setup lang="ts">
import type { Bet } from '~/types'

defineProps<{ bets: Bet[] }>()
</script>

<template>
  <section class="card bets-card">
    <header class="card-head"><h3>Your bets</h3><small class="muted">LAST 50</small></header>
    <p v-if="!bets.length" class="muted">No bets yet. Your next instinct could start something.</p>
    <div v-else class="bets-scroll">
    <table class="bets">
      <thead><tr><th>Round</th><th>Side</th><th>Bet</th><th>Payout</th></tr></thead>
      <tbody>
        <tr v-for="b in bets" :key="b.id">
          <td>#{{ b.round_number }}</td>
          <td><span :class="`tag tag-${b.side}`">{{ SIDE_LABEL[b.side] }}</span></td>
          <td>{{ formatCredits(b.amount) }} CR</td>
          <td>{{ b.payout === null ? '—' : `${formatCredits(b.payout)} CR` }}</td>
        </tr>
      </tbody>
    </table>
    </div>
  </section>
</template>
