<script setup lang="ts">
import type { SessionRecord } from '~/types'

definePageMeta({ layout: 'admin', adminTitle: 'Sessions' })

const { data, refresh, pending } = await useFetch<{ sessions: SessionRecord[] }>('/api/admin/sessions', { headers: useRequestHeaders(['cookie']) })

const q = ref('')
const kind = ref<'' | 'staff' | 'player'>('')
const day = ref('')
const activeOnly = ref(false)
const PAGE_SIZE = 10
const shown = ref(PAGE_SIZE)
watch([q, kind, day, activeOnly], () => (shown.value = PAGE_SIZE))

const manilaDay = (ts: number) => new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  return (data.value?.sessions ?? []).filter((s) =>
    (!term || `${s.accountName} ${s.username}`.toLowerCase().includes(term))
    && (!kind.value || s.accountKind === kind.value)
    && (!day.value || manilaDay(s.signedInAt) === day.value)
    && (!activeOnly.value || s.endedAt === null))
})

useHead({ title: 'Sessions · Kara Krus Admin' })
</script>

<template>
  <div>
    <header class="room-head">
      <div>
        <p class="eyebrow">ACCOUNT ACCESS</p>
        <h1 class="page-title">Sessions</h1>
        <p class="muted">Review session history for admins, staff, and players.</p>
      </div>
      <button type="button" class="btn btn-ghost" :disabled="pending" @click="refresh()">Refresh history</button>
    </header>

    <section class="card">
      <header class="card-intro">
        <div><h3>Session history</h3><p class="muted">Sign-ins, recent activity, and the reason each session ended.</p></div>
        <span class="tag tag-accent">{{ filtered.length }} sessions</span>
      </header>
      <form class="admin-filters" @submit.prevent>
        <label class="grow">Search accounts<input v-model="q" class="search" placeholder="Name, username or email"></label>
        <label>Account type
          <select v-model="kind">
            <option value="">All accounts</option>
            <option value="staff">Admins / staff</option>
            <option value="player">Players</option>
          </select>
        </label>
        <label>Date signed in<input v-model="day" type="date" class="search"></label>
        <label class="check switch"><input v-model="activeOnly" type="checkbox"> Show active sessions</label>
      </form>

      <ul class="session-list">
        <li v-for="s in filtered.slice(0, shown)" :key="s.id" class="session-row">
          <div>
            <b>{{ s.accountName }}</b>
            <small class="muted">{{ s.username }} · {{ s.accountKind === 'staff' ? 'Admin / staff' : 'Player' }}</small>
            <small class="muted">{{ s.device || 'Unknown device' }} · Location: {{ s.location || 'Unknown' }}</small>
          </div>
          <dl class="session-times">
            <div><dt class="muted">Signed in</dt><dd>{{ formatManila(s.signedInAt) }}</dd></div>
            <div><dt class="muted">Last active</dt><dd>{{ formatManila(s.lastActiveAt) }}</dd></div>
            <div v-if="s.endedAt"><dt class="muted">Ended</dt><dd>{{ formatManila(s.endedAt) }}</dd></div>
            <div v-else><dt class="muted">Expires</dt><dd>{{ formatManila(s.expiresAt) }}</dd></div>
          </dl>
          <div class="session-state">
            <span class="tag" :class="s.endedAt ? '' : 'tag-ok'">{{ s.endedAt ? 'Ended' : 'Active' }}</span>
            <small class="muted">{{ s.endReason ? SESSION_END_LABEL[s.endReason] : 'Still active' }}</small>
          </div>
        </li>
      </ul>
      <p v-if="!filtered.length" class="muted empty">No session history found.</p>
      <div v-if="filtered.length > shown" class="pager">
        <button type="button" class="btn btn-ghost small" @click="shown += PAGE_SIZE">Load more sessions</button>
      </div>
      <p class="fine card-foot">Location is approximate and may reflect a VPN or network provider. Older sessions may be unavailable.</p>
    </section>
  </div>
</template>
