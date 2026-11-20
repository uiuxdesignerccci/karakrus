<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const goHome = () => clearError({ redirect: '/' })
useHead({ title: `${props.error.statusCode} - ${props.error.statusMessage ?? 'Error'} | Kara Krus` })
</script>

<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.statusCode === 404 ? `Page not found: ${$route.path}` : error.statusMessage }}</p>
    <button class="btn btn-gold" type="button" @click="goHome">Go back home</button>
  </div>
</template>
