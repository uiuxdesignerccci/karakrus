<script setup lang="ts">
import type { ChatMessage } from '~/types'

const props = defineProps<{ roomId: number; username: string }>()

const MAX = 500
const text = ref('')
const sending = ref(false)
const list = ref<HTMLElement | null>(null)
const now = ref(Date.now())

const { data, refresh } = await useFetch<{ messages: ChatMessage[] }>(() => `/api/rooms/${props.roomId}/chat`, { default: () => ({ messages: [] }) })
const messages = computed(() => data.value?.messages ?? [])

const initials = (name: string) => name.slice(0, 2).toUpperCase()
/** Stable avatar colour per user: purple, orange or blue. */
const tone = (name: string) => [...name].reduce((n, c) => n + c.charCodeAt(0), 0) % 3

function ago(ts: number) {
  const s = Math.max(0, Math.round((now.value - ts) / 1000))
  if (s < 45) return 'now'
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

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
onMounted(() => {
  list.value?.scrollTo({ top: list.value.scrollHeight })
  timer = setInterval(() => {
    now.value = Date.now()
    refresh()
  }, 5000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <RoomPanel class="chat" title="Room chat" tone="purple">
    <template #icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.4A8 8 0 1 1 21 12Z" /><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" /></svg>
    </template>
    <template #sub><small class="rpanel-sub"><i class="online-dot" aria-hidden="true" />Room #{{ roomId }} · {{ messages.length }} message{{ messages.length === 1 ? '' : 's' }}</small></template>

    <div ref="list" class="chat-list" aria-live="polite">
      <div v-if="!messages.length" class="rpanel-empty">
        <span class="rpanel-empty-ico tone-purple" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.4A8 8 0 1 1 21 12Z" /><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" /></svg>
        </span>
        <p class="muted">No messages yet. Start the conversation.</p>
      </div>
      <div v-for="m in messages" :key="m.id" class="chat-msg" :class="{ mine: m.user === username }">
        <span class="chat-av" :class="`av-${tone(m.user)}`" aria-hidden="true">{{ initials(m.user) }}</span>
        <div>
          <div class="chat-meta"><b>{{ m.user }}</b><small>{{ ago(m.created_at) }}</small></div>
          <p>{{ m.text }}</p>
        </div>
      </div>
    </div>

    <form class="chat-form" @submit.prevent="send">
      <textarea v-model="text" rows="1" :maxlength="MAX" placeholder="Message the room…" aria-label="Message the room" @keydown="onKeydown" />
      <button type="submit" class="chat-send" :disabled="!text.trim() || sending" aria-label="Send message">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3Z" /></svg>
      </button>
    </form>
    <p class="chat-count" :class="{ near: text.length > MAX - 50 }"><span>Enter to send · Shift + Enter for a new line</span><span>{{ text.length }}/{{ MAX }}</span></p>
  </RoomPanel>
</template>
