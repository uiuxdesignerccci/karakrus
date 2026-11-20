<script setup lang="ts">
import type { Invitation } from '~/types'

const { data } = await useFetch<{ invitations: Invitation[] }>('/api/invitations', {
  headers: useRequestHeaders(['cookie']),
  default: () => ({ invitations: [] }),
})
const invitations = computed(() => data.value?.invitations ?? [])

useHead({ title: 'Invitations · Kara Krus' })
</script>

<template>
  <div class="page">
    <h1 class="page-title">VIP invitations</h1>
    <ul v-if="invitations.length" class="invites">
      <li v-for="i in invitations" :key="i.id" class="card">
        <b>{{ i.room_name }}</b>
        <NuxtLink :to="`/rooms/${i.room_id}`" class="btn btn-ghost small">Open room</NuxtLink>
      </li>
    </ul>
    <p v-else class="muted">No invitations yet. An administrator can invite you to a VIP room.</p>
  </div>
</template>
