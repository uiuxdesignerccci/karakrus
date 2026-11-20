<script setup lang="ts">
import type { AdminOverview } from '~/types'

definePageMeta({ layout: 'admin', adminTitle: 'Rooms' })

const { data, refresh } = await useFetch<AdminOverview>('/api/admin/overview', { headers: useRequestHeaders(['cookie']) })
const rooms = computed(() => data.value?.rooms ?? [])
const showCreate = ref(false)

useHead({ title: 'Rooms · Kara Krus Admin' })
</script>

<template>
  <div>
    <header class="room-head">
      <div>
        <p class="eyebrow">YOUR CONTROL ROOM</p>
        <h1 class="page-title">A room for every moment.</h1>
        <p class="muted">Create a table. Set the pace. Bring people together.</p>
      </div>
      <button type="button" class="btn btn-gold" @click="showCreate = true">Create room</button>
    </header>
    <AdminRoomTable :rooms="rooms" />
    <AdminRoomForm v-if="showCreate" @close="showCreate = false" @saved="showCreate = false; refresh()" />
  </div>
</template>
