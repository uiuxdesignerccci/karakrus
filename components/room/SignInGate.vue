<script setup lang="ts">
const route = useRoute()
const query = computed(() => ({ redirect: route.fullPath }))
</script>

<template>
  <section class="video-host signin-gate" aria-labelledby="signin-gate-title">
    <div class="video-stage">
      <div class="signin-gate-body">
        <span class="signin-gate-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="1.2" fill="currentColor" /></svg>
        </span>
        <h3 id="signin-gate-title">Sign in to watch the table</h3>
        <p>The live stream and room chat are for members. Sign in to watch the toss, chat with the room and place your call.</p>
        <div class="signin-gate-actions">
          <NuxtLink :to="{ path: '/login', query }" class="btn btn-gold">Sign in</NuxtLink>
          <NuxtLink :to="{ path: '/register', query }" class="btn btn-ghost">Join the club</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
