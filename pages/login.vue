<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const route = useRoute()
const form = reactive({ username: '', password: '' })
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await login({ ...form })
    await navigateTo(safeRedirect(route.query.redirect))
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage ?? 'Could not sign in'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Sign in · Kara Krus' })
</script>

<template>
  <AuthShell eyebrow="WELCOME TO THE CLUB" title="Good to see you." subtitle="Sign in to take a seat at the table." variant="player">
    <form class="form" @submit.prevent="submit">
      <label>Username<input v-model="form.username" autocomplete="username" required></label>
      <label>Password<input v-model="form.password" type="password" autocomplete="current-password" required></label>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn-gold wide" :disabled="busy">Sign in</button>
    </form>
    <p class="muted center auth-switch">New around here? <NuxtLink :to="{ path: '/register', query: route.query }">Join the club</NuxtLink></p>
    <aside class="dev-account">
      <small>DEVELOPMENT ACCOUNT</small>
      <code>player / MidnightPlayer123!</code>
    </aside>
    <p class="fine center">Secure sign-in · Demo credits only</p>
  </AuthShell>
</template>
