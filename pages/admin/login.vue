<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, logout, user } = useAuth()
const form = reactive({ username: '', password: '' })
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    const u = await login({ ...form })
    if (u.role !== 'admin') {
      await logout()
      error.value = 'This account does not have admin access'
      return
    }
    await navigateTo('/admin')
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage ?? 'Could not sign in'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Admin console · Kara Krus' })
void user
</script>

<template>
  <AuthShell eyebrow="ADMIN CONSOLE" title="Good to see you." subtitle="Sign in to manage your rooms and rounds." variant="admin">
    <form class="form" @submit.prevent="submit">
      <label>Username<input v-model="form.username" autocomplete="username" required></label>
      <label>Password<input v-model="form.password" type="password" autocomplete="current-password" required></label>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn-gold wide" :disabled="busy">Sign in</button>
    </form>
    <aside class="dev-account">
      <small>DEVELOPMENT ACCOUNT</small>
      <code>admin / MidnightAdmin123!</code>
    </aside>
    <p class="fine center">Secure sign-in · Demo credits only</p>
  </AuthShell>
</template>
