<script setup lang="ts">
import type { AdminOverview } from '~/types'

definePageMeta({ layout: 'admin', adminTitle: 'Overview' })

const { user } = useAuth()
const { data, refresh } = await useFetch<AdminOverview>('/api/admin/overview', { headers: useRequestHeaders(['cookie']) })
const o = computed(() => data.value!)
const showCreate = ref(false)

const stats = computed(() => [
  { label: 'Verified players', value: String(o.value.verifiedPlayers) },
  { label: 'Rooms taking bets', value: String(o.value.takingBets) },
  { label: 'Rounds completed', value: String(o.value.roundsCompleted) },
  { label: 'Platform fees · demo', value: `${formatCredits(o.value.fees)} CR` },
])

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => (timer = setInterval(refresh, 5000)))
onBeforeUnmount(() => clearInterval(timer))

useHead({ title: 'Overview · Kara Krus Admin' })
</script>

<template>
  <div>
    <header class="room-head">
      <div>
        <p class="eyebrow">YOUR CONTROL ROOM</p>
        <h1 class="page-title">Welcome back, {{ user?.firstName }}.</h1>
        <p class="muted">Here’s what’s happening across your tables.</p>
      </div>
      <button type="button" class="btn btn-gold" @click="showCreate = true">Create room</button>
    </header>

    <div class="admin-stats">
      <div v-for="s in stats" :key="s.label" class="card"><b>{{ s.value }}</b><span class="muted">{{ s.label }}</span></div>
    </div>

    <AdminRoomTable :rooms="o.rooms" />

    <section class="card audit">
      <header class="card-intro">
        <div><h3>Host activity</h3><p class="muted">The latest actions taken across your tables.</p></div>
        <NuxtLink to="/admin/audit" class="btn btn-ghost small">View audit trail</NuxtLink>
      </header>
      <p v-if="!o.audit.length" class="muted">No activity yet.</p>
      <ul v-else>
        <li v-for="a in o.audit" :key="a.id">
          <b>{{ a.action }}</b>
          <span class="muted">{{ a.room_name }} · {{ a.actor }}</span>
          <time class="muted">{{ new Date(a.created_at).toLocaleString('en-US') }}</time>
        </li>
      </ul>
    </section>

    <AdminRoomForm v-if="showCreate" @close="showCreate = false" @saved="showCreate = false; refresh()" />
  </div>
</template>
