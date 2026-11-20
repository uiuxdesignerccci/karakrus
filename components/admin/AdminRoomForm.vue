<script setup lang="ts">
import type { Room, RoomSettingsBody } from '~/types'

const props = defineProps<{ room?: Room }>()
const emit = defineEmits<{ close: []; saved: [room: Room] }>()

const form = reactive<RoomSettingsBody>({
  visibility: props.room?.visibility ?? 'public',
  name: props.room?.name ?? '',
  subtitle: props.room?.subtitle ?? '',
  min_bet: props.room ? props.room.min_bet / 100 : 10,
  max_bet: props.room ? props.room.max_bet / 100 : 1000,
  duration: props.room?.duration ?? 30,
})
const busy = ref(false)
const error = ref('')

async function submit() {
  busy.value = true
  error.value = ''
  try {
    const url = props.room ? `/api/admin/rooms/${props.room.id}` : '/api/admin/rooms'
    const res = await $fetch<{ room: Room }>(url, { method: props.room ? 'PATCH' : 'POST', body: { ...form } })
    emit('saved', res.room)
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage ?? 'Could not save the room'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="emit('close')">
      <form class="modal" role="dialog" aria-modal="true" aria-labelledby="room-form-title" @submit.prevent="submit">
        <h2 id="room-form-title">{{ room ? 'Set the room.' : 'Create a room.' }}</h2>
        <p class="muted center">Your table, your rhythm. All amounts use demo credits.</p>
        <div class="form">
          <label>Room access
            <select v-model="form.visibility">
              <option value="public">Public</option>
              <option value="vip">VIP · Invitation required</option>
            </select>
          </label>
          <label>Room name<input v-model="form.name" name="name" required></label>
          <label>Short description<input v-model="form.subtitle" name="subtitle"></label>
          <div class="row">
            <label>Minimum bet · CR<input v-model.number="form.min_bet" type="number" min="1" name="min_bet" required></label>
            <label>Maximum bet · CR<input v-model.number="form.max_bet" type="number" min="1" name="max_bet" required></label>
          </div>
          <label>Betting countdown · seconds<input v-model.number="form.duration" type="number" min="5" name="duration" required></label>
          <p class="fine">Configure live video in the room’s Coin-toss streaming panel after creating the room.</p>
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
          <div class="row">
            <button type="button" class="btn btn-ghost" @click="emit('close')">Cancel</button>
            <button type="submit" class="btn btn-gold" :disabled="busy">{{ room ? 'Save room settings' : 'Create room' }}</button>
          </div>
        </div>
      </form>
    </div>
  </Teleport>
</template>
