<script setup lang="ts">
import type { ChatMessage } from '~/types'

const props = defineProps<{ roomId: number; username: string }>()

const MAX = 500
const text = ref('')
const sending = ref(false)
const list = ref<HTMLElement | null>(null)

const { data, refresh } = await useFetch<{ messages: ChatMessage[] }>(() => `/api/rooms/${props.roomId}/chat`, { default: () => ({ messages: [] }) })
const messages = computed(() => data.value?.messages ?? [])

const initials = computed(() => props.username.slice(0, 2).toUpperCase())

async function send() {
  const body = text.value.trim()
  if (!body || sending.value) return
  sending.value = true
  try {
    await $fetch(`/api/rooms/${props.roomId}/chat`, { method: 'POST', body: { text: body } })
    text.value = ''
    await refresh()
    await nextTick()
    list.value?.scrollTo({ top: list.value.scrollHeight })
  } finally {
    sending.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => (timer = setInterval(refresh, 5000)))
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="card chat">
    <header class="chat-head">
      <span class="chat-icon" aria-hidden="true">💬</span>
      <div><h3>Room chat</h3><small class="muted">A conversation at your table</small></div>
      <span class="chip">Room #{{ roomId }}</span>
    </header>
    <div ref="list" class="chat-list">
      <p v-if="!messages.length" class="muted center">No messages yet. Start the conversation.</p>
      <div v-for="m in messages" :key="m.id" class="chat-msg" :class="{ mine: m.user === username }">
        <b>{{ m.user }}</b><span>{{ m.text }}</span>
      </div>
    </div>
    <form class="chat-form" @submit.prevent="send">
      <span class="avatar">{{ initials }}</span>
      <textarea v-model="text" rows="1" :maxlength="MAX" placeholder="Message" aria-label="Message" @keydown="onKeydown" />
      <button type="submit" class="btn btn-gold small" :disabled="!text.trim() || sending">Send</button>
    </form>
    <p class="fine"><span>Enter to send · Shift + Enter for a new line</span><span>{{ text.length }}/{{ MAX }}</span></p>
  </section>
</template>
