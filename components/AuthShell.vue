<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow: string
  title: string
  subtitle: string
  variant?: 'player' | 'admin'
  pitch?: 'login' | 'register'
}>(), { variant: 'player', pitch: 'login' })
</script>

<template>
  <div class="auth">
    <section class="auth-art">
      <BrandLogo />
      <template v-if="variant === 'admin'">
        <p class="eyebrow">BEHIND EVERY GREAT ROUND</p>
        <h1>Run the room.<br><em>Set the rhythm.</em></h1>
        <NuxtLink to="/login" class="btn btn-ghost small">Player portal</NuxtLink>
      </template>
      <template v-else-if="pitch === 'register'">
        <p class="eyebrow">THE MOMENT BEFORE THE FLIP</p>
        <h1>A little instinct.<br><em>A lot of possibility.</em></h1>
      </template>
      <template v-else>
        <h1>A familiar game.<br><em>An extraordinary little moment.</em></h1>
      </template>
      <div class="auth-coins" aria-hidden="true">
        <CoinFace side="kara" :size="220" />
        <CoinFace v-if="pitch !== 'register'" side="krus" :size="170" />
      </div>
      <p class="muted">One coin. Two sides. A shared experience.</p>
    </section>
    <section class="auth-card">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p class="muted">{{ subtitle }}</p>
      <slot />
    </section>
  </div>
</template>
