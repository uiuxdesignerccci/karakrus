<script setup lang="ts">
import type { Room } from '~/types'

const props = defineProps<{ room: Room }>()
const { user } = useAuth()
const route = useRoute()

const open = ref(false)
const rooms = ref<Room[] | null>(null)
const root = ref<HTMLElement | null>(null)
const menuId = useId()

const tableNo = (id: number) => String(id).padStart(2, '0')
/** Tables the player can actually enter, plus the one they are at. */
const tables = computed(() => [...(rooms.value ?? [])].sort((a, b) => a.id - b.id).filter((r) => r.id === props.room.id || r.visibility !== 'vip' || r.access === 'accepted'))

async function toggle() {
  open.value = !open.value
  if (open.value && !rooms.value) {
    try {
      rooms.value = (await $fetch<{ rooms: Room[] }>('/api/rooms')).rooms
    } catch {
      rooms.value = [props.room]
    }
  }
}

const onPointer = (e: PointerEvent) => {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') open.value = false
}
watch(() => route.fullPath, () => (open.value = false))
onMounted(() => {
  document.addEventListener('pointerdown', onPointer)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointer)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="table-picker" :class="{ open }">
    <h1>
      <button type="button" class="table-picker-btn" aria-haspopup="true" :aria-expanded="open" :aria-controls="menuId" @click="toggle">
        <span class="table-picker-ico" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="9" rx="9" ry="3.5" /><path d="M3 9v2c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V9M8 14.2V20M16 14.2V20" /></svg>
        </span>
        <span class="table-picker-name">Table {{ tableNo(room.id) }} – {{ room.name }}</span>
        <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </h1>
    <nav v-if="open" :id="menuId" class="table-menu" aria-label="Switch table">
      <p v-if="!rooms" class="muted">Loading tables…</p>
      <NuxtLink
        v-for="r in tables"
        :key="r.id"
        :to="`/rooms/${r.id}`"
        :class="{ current: r.id === room.id }"
        :aria-current="r.id === room.id ? 'page' : undefined"
      >
        <i class="dot" :class="`dot-${r.status}`" aria-hidden="true" />
        <span class="table-menu-name"><b>{{ tableNo(r.id) }}</b>{{ r.name }}</span>
        <small>{{ STATUS_LABEL[r.status] }}</small>
      </NuxtLink>
      <hr>
      <NuxtLink :to="user ? '/lobby' : '/'" class="table-menu-lobby">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        {{ user ? 'Back to lobby' : 'Back to home' }}
      </NuxtLink>
    </nav>
  </div>
</template>
