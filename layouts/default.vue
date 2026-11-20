<script setup lang="ts">
const { data } = await useFetch<{ announcement: string }>('/api/announcement', { default: () => ({ announcement: '' }) })
</script>

<template>
  <div class="shell">
    <p v-if="data?.announcement" class="announcement" role="status">{{ data.announcement }}</p>
    <AppHeader />
    <main class="shell-main">
      <slot />
    </main>
    <AppFooter />
    <HowToPlayModal />
  </div>
</template>
