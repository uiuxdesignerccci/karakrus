<script setup lang="ts">
definePageMeta({ layout: 'admin', adminTitle: 'Settings' })

const { data } = await useFetch<{ announcement: string }>('/api/admin/settings', { headers: useRequestHeaders(['cookie']) })
const announcement = ref(data.value?.announcement ?? '')
const annMsg = ref('')

const pw = reactive({ current: '', next: '' })
const pwMsg = ref('')

async function saveAnnouncement() {
  const res = await $fetch<{ announcement: string }>('/api/admin/settings', { method: 'PUT', body: { announcement: announcement.value } })
  announcement.value = res.announcement
  annMsg.value = 'Announcement saved.'
}

async function updatePassword() {
  pwMsg.value = ''
  try {
    await $fetch('/api/admin/password', { method: 'POST', body: { current: pw.current, next: pw.next } })
    pw.current = pw.next = ''
    pwMsg.value = 'Password updated.'
  } catch (e) {
    pwMsg.value = (e as { statusMessage?: string }).statusMessage ?? 'Could not update password'
  }
}

const config = [
  ['Coin count', '1 coin per round'],
  ['Winning pool return', '95% · 5% platform fee'],
  ['Currency', 'Virtual demo credits'],
  ['Email delivery', 'Development terminal only'],
]

useHead({ title: 'Settings · Kara Krus Admin' })
</script>

<template>
  <div>
    <header class="room-head">
      <div>
        <p class="eyebrow">THE DETAILS THAT MATTER</p>
        <h1 class="page-title">Keep things running smoothly.</h1>
        <p class="muted">Manage your club announcement and account security.</p>
      </div>
    </header>

    <section class="card settings-card">
      <h3>Club announcement</h3>
      <p class="muted">A short message displayed at the top of the player portal.</p>
      <form class="form" @submit.prevent="saveAnnouncement">
        <label>Announcement<input v-model="announcement" maxlength="200"></label>
        <button type="submit" class="btn btn-gold">Save announcement</button>
        <p v-if="annMsg" class="muted">{{ annMsg }}</p>
      </form>
    </section>

    <section class="card settings-card">
      <h3>Account security</h3>
      <p class="muted">Choose a strong password unique to this account.</p>
      <form class="form" @submit.prevent="updatePassword">
        <label>Current password<input v-model="pw.current" type="password" autocomplete="current-password" required></label>
        <label>New password<input v-model="pw.next" type="password" autocomplete="new-password" minlength="10" required></label>
        <button type="submit" class="btn btn-gold">Update password</button>
        <p v-if="pwMsg" class="muted">{{ pwMsg }}</p>
      </form>
    </section>

    <section class="card settings-card">
      <h3>Game configuration</h3>
      <dl class="config">
        <template v-for="[k, v] in config" :key="k"><dt class="muted">{{ k }}</dt><dd>{{ v }}</dd></template>
      </dl>
      <p class="fine">Countdown, credit limits, and host video are configured in each room. SMTP credentials belong in server environment variables.</p>
    </section>
  </div>
</template>
