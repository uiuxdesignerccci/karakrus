<script setup lang="ts">
const { show } = useHowToPlay()
const { user } = useAuth()

const year = new Date().getFullYear()
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
  <footer class="site-footer">
    <div class="footer-deco" aria-hidden="true">
      <CoinFace side="kara" :size="180" />
    </div>

    <div class="site-footer-top">
      <div class="footer-brand">
        <BrandLogo />
        <p class="footer-tagline">A familiar game.<br><em>An extraordinary little moment.</em></p>
      </div>

      <nav class="footer-col" aria-label="Play">
        <h4>Play</h4>
        <NuxtLink to="/">Discover</NuxtLink>
        <NuxtLink to="/lobby">Live lobby</NuxtLink>
        <NuxtLink to="/invitations">Invitations</NuxtLink>
      </nav>

      <nav class="footer-col" aria-label="Help">
        <h4>Help</h4>
        <button type="button" @click="show">How to play</button>
        <button type="button" @click="show">Rules &amp; payouts</button>
      </nav>

      <nav class="footer-col" aria-label="Club">
        <h4>Club</h4>
        <NuxtLink v-if="!user" to="/login">Sign in</NuxtLink>
        <NuxtLink v-if="!user" to="/register">Join the club</NuxtLink>
        <NuxtLink to="/admin">Admin console</NuxtLink>
      </nav>
    </div>

    <div class="site-footer-bottom">
      <span>© {{ year }} Kara Krus. All sides welcome.</span>
      <button type="button" class="footer-top-btn" @click="toTop">
        Back to top
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
    </div>
  </footer>
</template>
