<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const route = useRoute()
const form = reactive({ firstName: '', lastName: '', birthdate: '', email: '', username: '', password: '', ageConfirmed: false })
const showPassword = ref(false)
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await register({ ...form })
    await navigateTo(safeRedirect(route.query.redirect))
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage ?? 'Could not create your account'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'Join the club · Kara Krus' })
</script>

<template>
  <AuthShell eyebrow="WELCOME TO THE CLUB" title="Make your first call." subtitle="Create your account. Your seat is waiting." variant="player" pitch="register">
    <form class="form" @submit.prevent="submit">
      <div class="row">
        <label>First name<input v-model="form.firstName" autocomplete="given-name" required></label>
        <label>Last name<input v-model="form.lastName" autocomplete="family-name" required></label>
      </div>
      <label>Birthdate · 18 years or older<input v-model="form.birthdate" type="date" required></label>
      <label>Email address<input v-model="form.email" type="email" placeholder="you@example.com" autocomplete="email" required></label>
      <label>Username<input v-model="form.username" placeholder="Your username" autocomplete="username" required></label>
      <label>
        Password
        <span class="pw">
          <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="At least 10 characters" minlength="10" autocomplete="new-password" required>
          <button type="button" class="icon-btn" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">👁</button>
        </span>
      </label>
      <label class="check"><input v-model="form.ageConfirmed" type="checkbox" required> I am 18 or older and understand this is a demo using virtual credits. <span class="req">*</span></label>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn-gold wide" :disabled="busy">Create account</button>
    </form>
    <p class="muted center">Already a member? <NuxtLink :to="{ path: '/login', query: route.query }">Sign in</NuxtLink></p>
    <p class="fine center">Secure sign-in · Demo credits only</p>
  </AuthShell>
</template>
