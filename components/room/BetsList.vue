<script setup lang="ts">
import type { Bet } from '~/types'

defineProps<{ bets: Bet[] }>()
</script>

<template>
  <RoomPanel class="bets-card" title="Your bets" tone="blue">
    <template #icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4.5a2.5 2.5 0 0 0 0-5Z" /><path d="M14 5v2M14 11v2M14 17v2" /></svg>
    </template>
    <template v-if="bets.length" #aside><small class="rpanel-meta">Last 50</small></template>
    <div v-if="!bets.length" class="rpanel-empty">
      <span class="rpanel-empty-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4.5a2.5 2.5 0 0 0 0-5Z" /><path d="M14 5v2M14 11v2M14 17v2" /></svg>
      </span>
      <p class="muted">No bets yet. Place your bet to get started.</p>
    </div>
    <div v-else class="bets-scroll">
      <table class="bets">
        <thead><tr><th>Round</th><th>Side</th><th>Bet</th><th>Payout</th></tr></thead>
        <tbody>
          <tr v-for="b in bets" :key="b.id">
            <td>#{{ b.round_number }}</td>
            <td><span :class="`tag tag-${b.side}`">{{ SIDE_LABEL[b.side] }}</span></td>
            <td>{{ formatCredits(b.amount) }}</td>
            <td>{{ b.payout === null ? '—' : formatCredits(b.payout) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </RoomPanel>
</template>
