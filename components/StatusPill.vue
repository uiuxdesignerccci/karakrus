<script setup lang="ts">
import type { RoomStatus } from '~/types'

defineProps<{ status: RoomStatus }>()
</script>

<template>
  <span class="pill" :class="`pill-${status}`"><i aria-hidden="true" />{{ STATUS_LABEL[status] }}</span>
</template>
