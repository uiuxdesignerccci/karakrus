<script setup lang="ts">
const { show } = useHowToPlay()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-top">
      <BrandLogo />
      <p class="footer-tagline">A familiar game.<br>An extraordinary little moment.</p>
      <nav class="footer-links" aria-label="Footer">
        <NuxtLink to="/admin">Admin console</NuxtLink>
        <button type="button" @click="show">Rules &amp; payouts</button>
      </nav>
    </div>
    <div class="site-footer-bottom">
      <span>© 2026 Kara Krus. All sides welcome.</span>
      <span>18+ · DEMO CREDITS ONLY · PLAY MINDFULLY</span>
      <span>Made in the Philippines <i class="live-dot" aria-hidden="true" /></span>
    </div>
  </footer>
</template>
