<script setup lang="ts">
import type { AdminPlayer, AdminPlayersResponse } from '~/types'

definePageMeta({ layout: 'admin', adminTitle: 'Players' })

const { data, refresh, pending } = await useFetch<AdminPlayersResponse>('/api/admin/players', { headers: useRequestHeaders(['cookie']) })

const q = ref('')
const verification = ref<'all' | 'verified' | 'unverified'>('all')
const session = ref<'all' | 'in' | 'out'>('all')
const resetFilters = () => { q.value = ''; verification.value = 'all'; session.value = 'all' }

const players = computed(() => {
  const term = q.value.trim().toLowerCase()
  return (data.value?.players ?? []).filter((p) =>
    (!term || `${p.firstName} ${p.lastName} ${p.username} ${p.email}`.toLowerCase().includes(term))
    && (verification.value === 'all' || p.verified === (verification.value === 'verified'))
    && (session.value === 'all' || p.signedIn === (session.value === 'in')))
})

const stats = computed(() => {
  const m = data.value?.metrics
  return [
    { label: 'Total players', value: m?.total ?? 0 },
    { label: 'Active players', value: m?.active ?? 0 },
    { label: 'Blocked players', value: m?.blocked ?? 0 },
    { label: 'Signed-in players', value: m?.signedIn ?? 0 },
  ]
})

const viewing = ref<AdminPlayer | null>(null)
const confirming = ref<AdminPlayer | null>(null)
const busy = ref(false)
const message = ref('')

async function setStatus() {
  const p = confirming.value
  if (!p) return
  busy.value = true
  try {
    await $fetch(`/api/admin/players/${p.id}/status`, { method: 'PUT', body: { active: !p.active } })
    message.value = p.active ? 'Player blocked and signed out.' : 'Player unblocked. They can sign in again.'
    confirming.value = null
    viewing.value = null
    await refresh()
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Players · Kara Krus Admin' })
</script>

<template>
  <div>
    <header class="room-head">
      <div>
        <p class="eyebrow">PLAYER ACCOUNTS</p>
        <h1 class="page-title">Players</h1>
        <p class="muted">Review player accounts, activity, and platform access.</p>
      </div>
      <button type="button" class="btn btn-ghost" :disabled="pending" @click="refresh()">Refresh players</button>
    </header>

    <div class="admin-stats">
      <div v-for="s in stats" :key="s.label" class="card"><b>{{ s.value }}</b><span class="muted">{{ s.label }}</span></div>
    </div>

    <p v-if="message" class="admin-flash" role="status">{{ message }}</p>

    <section class="card">
      <header class="card-intro">
        <div><h3>Player accounts</h3><p class="muted">Search players, review their details and manage platform access.</p></div>
        <span class="tag tag-accent">{{ players.length }} shown</span>
      </header>
      <form class="admin-filters" @submit.prevent>
        <label class="grow">Search players<input v-model="q" class="search" placeholder="Name, username or email"></label>
        <label>Verification
          <select v-model="verification">
            <option value="all">All verification states</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </label>
        <label>Session status
          <select v-model="session">
            <option value="all">All sessions</option>
            <option value="in">Signed in</option>
            <option value="out">Signed out</option>
          </select>
        </label>
        <button type="button" class="btn btn-ghost small" @click="resetFilters">Reset filters</button>
      </form>

      <div class="table-wrap">
        <table class="bets">
          <thead><tr><th>Player</th><th>Email</th><th>Verification</th><th>Access</th><th>Balance</th><th>Session</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="p in players" :key="p.id">
              <td><b>{{ p.firstName }} {{ p.lastName }}</b><br><small class="muted">@{{ p.username }} · #{{ p.id }}</small></td>
              <td>{{ p.email }}</td>
              <td><span class="tag" :class="p.verified ? 'tag-ok' : 'tag-warn'">{{ p.verified ? 'Verified' : 'Unverified' }}</span></td>
              <td><span class="tag" :class="p.active ? 'tag-ok' : 'tag-bad'">{{ p.active ? 'Active' : 'Blocked' }}</span></td>
              <td>{{ formatCredits(p.balance) }} CR</td>
              <td><span class="tag" :class="p.signedIn ? 'tag-ok' : ''">{{ p.signedIn ? 'Signed in' : 'Signed out' }}</span></td>
              <td>
                <div class="actions">
                <button type="button" class="btn btn-ghost small" :aria-label="`View details for ${p.username}`" @click="viewing = p">View details</button>
                <button type="button" class="btn btn-ghost small" :class="{ danger: p.active }" @click="confirming = p">{{ p.active ? 'Block' : 'Unblock' }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!players.length" class="muted empty">No players match these filters.</p>
      <p class="fine card-foot">Active accounts are unblocked, including unverified players. Signed-in counts reflect unexpired sessions. Metrics cover all players.</p>
    </section>

    <AdminModal v-if="viewing" :title="`Player: ${viewing.username}`" description="Player details and platform access." @close="viewing = null">
      <dl class="config">
        <dt class="muted">Player ID</dt><dd>#{{ viewing.id }}</dd>
        <dt class="muted">Username</dt><dd>{{ viewing.username }}</dd>
        <dt class="muted">First name</dt><dd>{{ viewing.firstName }}</dd>
        <dt class="muted">Last name</dt><dd>{{ viewing.lastName }}</dd>
        <dt class="muted">Email</dt><dd>{{ viewing.email }}</dd>
        <dt class="muted">Birthdate</dt><dd>{{ viewing.birthdate || 'Unknown' }}</dd>
        <dt class="muted">Balance</dt><dd>{{ formatCredits(viewing.balance) }} CR</dd>
        <dt class="muted">Verification</dt><dd>{{ viewing.verified ? 'Verified' : 'Unverified' }}</dd>
        <dt class="muted">Access</dt><dd>{{ viewing.active ? 'Active' : 'Blocked' }}</dd>
        <dt class="muted">Session status</dt><dd>{{ viewing.signedIn ? 'Signed in' : 'Signed out' }}</dd>
      </dl>
      <template #actions>
        <button type="button" class="btn btn-ghost" @click="viewing = null">Close</button>
        <button type="button" class="btn" :class="viewing.active ? 'btn-danger' : 'btn-gold'" @click="confirming = viewing">{{ viewing.active ? 'Block player' : 'Unblock player' }}</button>
      </template>
    </AdminModal>

    <AdminModal
      v-if="confirming"
      :title="confirming.active ? 'Block player?' : 'Unblock player?'"
      :description="confirming.active
        ? 'This signs the player out immediately and prevents sign-in. Their balance is preserved and existing bets settle normally.'
        : 'This player will be able to sign in again. Previous sessions stay ended.'"
      @close="confirming = null"
    >
      <template #actions>
        <button type="button" class="btn btn-ghost" :disabled="busy" @click="confirming = null">Cancel</button>
        <button type="button" class="btn" :class="confirming.active ? 'btn-danger' : 'btn-gold'" :disabled="busy" @click="setStatus">
          {{ confirming.active ? 'Confirm block' : 'Confirm unblock' }}
        </button>
      </template>
    </AdminModal>
  </div>
</template>
