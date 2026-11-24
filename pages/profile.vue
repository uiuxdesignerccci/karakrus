<script setup lang="ts">
import type { Bet, Side, User } from '~/types'

interface ProfileData {
  user: User
  stats: { bets: number; settled: number; wins: number; wagered: number; net: number; favorite: Side | null; sides: Record<Side, number> }
  recent: (Bet & { room_name: string })[]
}

const { user, logout } = useAuth()
const { data, refresh } = await useFetch<ProfileData>('/api/profile', { headers: useRequestHeaders(['cookie']) })

const stats = computed(() => data.value?.stats)
const recent = computed(() => data.value?.recent ?? [])
const winRate = computed(() => (stats.value?.settled ? Math.round((stats.value.wins / stats.value.settled) * 100) : 0))
const karaShare = computed(() => {
  const s = stats.value?.sides
  return s && s.kara + s.krus ? Math.round((s.kara / (s.kara + s.krus)) * 100) : 50
})
const initials = computed(() => `${user.value?.firstName?.[0] ?? ''}${user.value?.lastName?.[0] ?? ''}`.toUpperCase() || '?')

// Personal details
const details = reactive({ firstName: '', lastName: '', email: '' })
const resetDetails = () => Object.assign(details, { firstName: user.value?.firstName ?? '', lastName: user.value?.lastName ?? '', email: user.value?.email ?? '' })
resetDetails()
const detailsDirty = computed(() => details.firstName !== user.value?.firstName || details.lastName !== user.value?.lastName || details.email !== user.value?.email)
const detailsMsg = ref<{ ok: boolean; text: string } | null>(null)
const savingDetails = ref(false)

async function saveDetails() {
  savingDetails.value = true
  detailsMsg.value = null
  try {
    const res = await $fetch<{ user: User }>('/api/profile', { method: 'PATCH', body: details })
    user.value = res.user
    resetDetails()
    detailsMsg.value = { ok: true, text: 'Your details have been saved.' }
  }
  catch (e) {
    detailsMsg.value = { ok: false, text: errorText(e) }
  }
  finally {
    savingDetails.value = false
  }
}

// Password
const pw = reactive({ current: '', next: '', confirm: '' })
const pwMsg = ref<{ ok: boolean; text: string } | null>(null)
const savingPw = ref(false)

async function updatePassword() {
  pwMsg.value = null
  if (pw.next !== pw.confirm) {
    pwMsg.value = { ok: false, text: 'The new passwords don’t match.' }
    return
  }
  savingPw.value = true
  try {
    await $fetch('/api/profile/password', { method: 'POST', body: { current: pw.current, next: pw.next } })
    Object.assign(pw, { current: '', next: '', confirm: '' })
    pwMsg.value = { ok: true, text: 'Password updated.' }
  }
  catch (e) {
    pwMsg.value = { ok: false, text: errorText(e) }
  }
  finally {
    savingPw.value = false
  }
}

function errorText(e: unknown) {
  const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
  return err.data?.statusMessage ?? err.statusMessage ?? 'Something went wrong. Please try again.'
}

const when = (t: number) => new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

onMounted(() => refresh())
useHead({ title: 'Profile · Kara Krus' })
</script>

<template>
  <div class="page profile-page">
    <section class="profile-hero">
      <div class="profile-id">
        <span class="profile-avatar" aria-hidden="true">{{ initials }}</span>
        <div>
          <p class="eyebrow">YOUR PROFILE</p>
          <h1>{{ user?.firstName }} {{ user?.lastName }}</h1>
          <p class="profile-handle">@{{ user?.username }} <span class="tag">Player</span></p>
        </div>
      </div>
      <div class="profile-balance">
        <small>Balance</small>
        <b>{{ formatCredits(user?.balance ?? 0) }} <span>CR</span></b>
        <NuxtLink to="/lobby" class="btn btn-gold">Find a table</NuxtLink>
      </div>
    </section>

    <section class="profile-stats">
      <div><small>Bets placed</small><b>{{ stats?.bets ?? 0 }}</b></div>
      <div><small>Win rate</small><b>{{ winRate }}%</b><span class="muted">{{ stats?.wins ?? 0 }} of {{ stats?.settled ?? 0 }} settled</span></div>
      <div><small>Credits wagered</small><b>{{ formatCredits(stats?.wagered ?? 0) }}</b></div>
      <div>
        <small>Net result</small>
        <b :class="{ up: (stats?.net ?? 0) > 0, down: (stats?.net ?? 0) < 0 }">{{ (stats?.net ?? 0) > 0 ? '+' : '' }}{{ formatCredits(stats?.net ?? 0) }}</b>
      </div>
      <div class="profile-side">
        <small>Favourite side</small>
        <div class="profile-side-row">
          <CoinFace v-if="stats?.favorite" :side="stats.favorite" :size="34" />
          <b>{{ stats?.favorite ? SIDE_LABEL[stats.favorite] : '—' }}</b>
        </div>
        <div class="side-split" :class="{ empty: !stats?.favorite }" :title="`Kara ${karaShare}% · Krus ${100 - karaShare}%`"><i :style="{ width: `${karaShare}%` }" /></div>
      </div>
    </section>

    <div class="profile-grid">
      <section class="card profile-card">
        <h3>Personal details</h3>
        <p class="muted">How you appear at the tables and how we reach you.</p>
        <form class="form" @submit.prevent="saveDetails">
          <div class="row">
            <label>First name<input v-model="details.firstName" autocomplete="given-name" maxlength="40" required></label>
            <label>Last name<input v-model="details.lastName" autocomplete="family-name" maxlength="40" required></label>
          </div>
          <label>Email<input v-model="details.email" type="email" autocomplete="email" required></label>
          <label>Username<input :value="user?.username" disabled></label>
          <p class="fine">Usernames can’t be changed.</p>
          <div class="profile-actions">
            <button type="submit" class="btn btn-gold" :disabled="!detailsDirty || savingDetails">{{ savingDetails ? 'Saving…' : 'Save changes' }}</button>
            <button v-if="detailsDirty" type="button" class="btn btn-ghost" @click="resetDetails">Cancel</button>
          </div>
          <p v-if="detailsMsg" :class="detailsMsg.ok ? 'form-ok' : 'form-error'" role="status">{{ detailsMsg.text }}</p>
        </form>
      </section>

      <section class="card profile-card">
        <h3>Password</h3>
        <p class="muted">Use at least 10 characters. Pick one you don’t use elsewhere.</p>
        <form class="form" @submit.prevent="updatePassword">
          <label>Current password<input v-model="pw.current" type="password" autocomplete="current-password" required></label>
          <label>New password<input v-model="pw.next" type="password" autocomplete="new-password" minlength="10" required></label>
          <label>Confirm new password<input v-model="pw.confirm" type="password" autocomplete="new-password" minlength="10" required></label>
          <div class="profile-actions">
            <button type="submit" class="btn btn-gold" :disabled="savingPw">{{ savingPw ? 'Updating…' : 'Update password' }}</button>
          </div>
          <p v-if="pwMsg" :class="pwMsg.ok ? 'form-ok' : 'form-error'" role="status">{{ pwMsg.text }}</p>
        </form>
      </section>
    </div>

    <section class="card bets-card profile-bets">
      <header class="card-head"><h3>Recent bets</h3><small class="muted">LAST 10</small></header>
      <p v-if="!recent.length" class="muted">No bets yet. <NuxtLink to="/lobby">Pick a table</NuxtLink> and make your first call.</p>
      <div v-else class="bets-scroll">
        <table class="bets">
          <thead><tr><th>Table</th><th>Round</th><th>Side</th><th>Bet</th><th>Result</th><th>When</th></tr></thead>
          <tbody>
            <tr v-for="b in recent" :key="b.id">
              <td><NuxtLink :to="`/rooms/${b.room_id}`">{{ b.room_name }}</NuxtLink></td>
              <td>#{{ b.round_number }}</td>
              <td><span :class="`tag tag-${b.side}`">{{ SIDE_LABEL[b.side] }}</span></td>
              <td>{{ formatCredits(b.amount) }} CR</td>
              <td>
                <span v-if="b.payout === null" class="muted">Pending</span>
                <span v-else-if="b.payout > 0" class="up">Won {{ formatCredits(b.payout) }} CR</span>
                <span v-else class="down">Lost</span>
              </td>
              <td class="muted">{{ when(b.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="profile-foot">
      <button type="button" class="btn btn-ghost danger" @click="logout">Sign out</button>
    </div>
  </div>
</template>
