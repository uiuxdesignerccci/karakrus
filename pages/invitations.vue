<script setup lang="ts">
import type { Invitation, Room } from '~/types'

const { user } = useAuth()
const headers = useRequestHeaders(['cookie'])

const { data } = await useFetch<{ invitations: Invitation[] }>('/api/invitations', {
  headers,
  default: () => ({ invitations: [] }),
})
const { data: roomData } = await useFetch<{ rooms: Room[] }>('/api/rooms', {
  headers,
  default: () => ({ rooms: [] }),
})

const invitations = computed(() => data.value?.invitations ?? [])
const roomById = computed(() => new Map((roomData.value?.rooms ?? []).map(r => [r.id, r])))

const counts = computed(() => ({
  pending: invitations.value.filter(i => i.status === 'pending').length,
  accepted: invitations.value.filter(i => i.status === 'accepted').length,
}))

const STATUS_LABEL: Record<Invitation['status'], string> = {
  pending: 'New invite',
  accepted: 'Accepted',
  declined: 'Declined',
}

const steps = [
  { title: 'Get the nod', text: 'A host invites you to one of the club’s private tables.' },
  { title: 'Find it here', text: 'Your invitation appears on this page the moment it’s sent.' },
  { title: 'Take your seat', text: 'Open the room and play alongside a smaller, closer crowd.' },
]

useHead({ title: 'Invitations · Kara Krus' })
</script>

<template>
  <div class="page invites-page">
    <header class="invites-head">
      <div>
        <p class="eyebrow">VIP INVITATIONS</p>
        <h1 class="page-title">Your private tables{{ user ? `, ${user.firstName}` : '' }}.</h1>
        <p class="muted">Invite-only rooms with a smaller crowd and the same single coin.</p>
      </div>
      <div v-if="invitations.length" class="invites-counts">
        <span><b>{{ counts.pending }}</b> new</span>
        <span><b>{{ counts.accepted }}</b> accepted</span>
      </div>
    </header>

    <ul v-if="invitations.length" class="invite-grid">
      <li v-for="i in invitations" :key="i.id" class="invite-card" :class="`is-${i.status}`">
        <div class="invite-band">
          <span class="invite-vip">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" /></svg>
            VIP TABLE
          </span>
          <span class="invite-status">{{ STATUS_LABEL[i.status] }}</span>
        </div>
        <div class="invite-body">
          <h2>{{ i.room_name }}</h2>
          <p class="muted">{{ roomById.get(i.room_id)?.subtitle ?? 'A private table at the club.' }}</p>
          <dl v-if="roomById.get(i.room_id)" class="invite-meta">
            <div><dt>Bets</dt><dd>{{ roomById.get(i.room_id)!.min_bet / 100 }}–{{ (roomById.get(i.room_id)!.max_bet / 100).toLocaleString('en-US') }} CR</dd></div>
            <div><dt>Rounds</dt><dd>{{ roomById.get(i.room_id)!.duration }}s</dd></div>
          </dl>
        </div>
        <div class="invite-foot">
          <NuxtLink v-if="i.status !== 'declined'" :to="`/rooms/${i.room_id}`" class="btn btn-gold">Open room</NuxtLink>
          <span v-else class="muted">You passed on this one.</span>
        </div>
      </li>
    </ul>

    <section v-else class="invite-empty">
      <div class="invite-empty-art" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
      </div>
      <h2>No invitations yet</h2>
      <p class="muted">When a host invites you to a VIP table, it will show up here. The public tables are always open in the meantime.</p>
      <NuxtLink to="/lobby" class="btn btn-gold">Browse the lobby</NuxtLink>
    </section>

    <section class="invite-steps">
      <h3>How VIP invitations work</h3>
      <ol>
        <li v-for="(s, n) in steps" :key="s.title">
          <span class="invite-step-num">{{ n + 1 }}</span>
          <div><b>{{ s.title }}</b><p class="muted">{{ s.text }}</p></div>
        </li>
      </ol>
    </section>
  </div>
</template>
