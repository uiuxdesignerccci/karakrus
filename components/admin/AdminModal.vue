<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
const emit = defineEmits<{ close: [] }>()
const id = useId()
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="emit('close')" @keydown.esc="emit('close')">
      <div class="modal admin-modal" role="dialog" aria-modal="true" :aria-labelledby="id">
        <header>
          <h2 :id="id">{{ title }}</h2>
          <p v-if="description" class="muted">{{ description }}</p>
        </header>
        <slot />
        <div v-if="$slots.actions" class="admin-modal-actions"><slot name="actions" /></div>
      </div>
    </div>
  </Teleport>
</template>
