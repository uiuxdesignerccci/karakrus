<script setup lang="ts">
import type { Room } from '~/types'

defineProps<{ rooms: Room[] }>()
</script>

<template>
  <section class="card">
    <header class="card-head"><h3>Your tables</h3><small class="muted">{{ rooms.length }} ROOMS</small></header>
    <table class="bets">
      <thead><tr><th>Room</th><th>Status</th><th>Round</th><th>Participants</th><th>Pool</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="r in rooms" :key="r.id">
          <td>
            <NuxtLink :to="`/admin/rooms/${r.id}`"><b>{{ r.name }}</b></NuxtLink><br>
            <small class="muted">{{ formatCredits(r.min_bet) }}–{{ formatCredits(r.max_bet) }} CR · {{ r.duration }}s</small>
          </td>
          <td><StatusPill :status="r.status" /></td>
          <td>#{{ String(r.round_number).padStart(3, '0') }}</td>
          <td>{{ r.players }}</td>
          <td>{{ formatCredits(r.pool_kara + r.pool_krus) }} CR</td>
          <td><NuxtLink :to="`/admin/rooms/${r.id}`" class="btn btn-ghost small">Manage</NuxtLink></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
