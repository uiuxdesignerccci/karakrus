<script setup lang="ts">
import type { RoundResult, Side } from '~/types'

/** `strip`: the wide version under the room video (coins + side split + streak). Default: a rail card. */
const props = defineProps<{ history: RoundResult[]; strip?: boolean }>()

const count = (side: Side) => props.history.filter((h) => h.result === side).length
const karaPct = computed(() => (props.history.length ? Math.round((count('kara') / props.history.length) * 100) : 50))
/** Consecutive results matching the latest flip (history is newest first). */
const streak = computed(() => {
  const first = props.history[0]?.result
  if (!first) return null
  let n = 0
  while (props.history[n]?.result === first) n++
  return { side: first, n }
})
</script>

<template>
  <section v-if="strip" class="flips-strip" aria-labelledby="flips-strip-title">
    <header class="flips-strip-head">
      <span class="rpanel-icon tone-orange" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>
      </span>
      <h3 id="flips-strip-title">Recent flips</h3>
      <small v-if="history.length" class="rpanel-meta">Last {{ history.length }}</small>
      <span class="spacer" />
      <span v-if="streak && streak.n > 1" class="tag" :class="`tag-${streak.side}`">{{ SIDE_LABEL[streak.side] }} × {{ streak.n }} streak</span>
    </header>

    <div v-if="!history.length" class="rpanel-empty">
      <span class="rpanel-empty-ico tone-orange" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" /></svg>
      </span>
      <p class="muted">The story starts with the first flip.</p>
    </div>
    <template v-else>
      <ol class="flips flips-row">
        <li v-for="(h, i) in history" :key="h.round" :class="[`flip-${h.result}`, { latest: i === 0 }]" :title="`Round ${h.round}: ${SIDE_LABEL[h.result]}`">
          <CoinFace :side="h.result" :size="40" />
          <small>#{{ h.round }}</small>
        </li>
      </ol>
      <div class="flips-split">
        <span class="flips-split-kara">Kara <b>{{ count('kara') }}</b></span>
        <div class="side-split" role="img" :aria-label="`Kara ${count('kara')}, Krus ${count('krus')} in the last ${history.length} rounds`"><i :style="{ width: `${karaPct}%` }" /></div>
        <span class="flips-split-krus"><b>{{ count('krus') }}</b> Krus</span>
      </div>
    </template>
  </section>

  <RoomPanel v-else class="flips-panel" title="Recent flips" tone="orange">
    <template #icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>
    </template>
    <template v-if="history.length" #aside><small class="rpanel-meta">Last {{ history.length }}</small></template>
    <div v-if="!history.length" class="rpanel-empty">
      <span class="rpanel-empty-ico tone-orange" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" /></svg>
      </span>
      <p class="muted">The story starts with the first flip.</p>
    </div>
    <ul v-else class="flips">
      <li v-for="(h, i) in history" :key="h.round" :class="[`flip-${h.result}`, { latest: i === 0 }]" :title="`Round ${h.round}: ${SIDE_LABEL[h.result]}`">
        <CoinFace :side="h.result" :size="34" />
      </li>
    </ul>
  </RoomPanel>
</template>
