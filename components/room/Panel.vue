<script setup lang="ts">
/** Collapsible side-rail card used by the room page (recent flips, bets, chat). */
const props = withDefaults(defineProps<{ title: string; tone?: 'purple' | 'orange' | 'blue'; collapsible?: boolean }>(), {
  tone: 'purple',
  collapsible: true,
})
const open = ref(true)
const bodyId = useId()
</script>

<template>
  <section class="rpanel" :class="{ collapsed: !open }">
    <header class="rpanel-head">
      <span class="rpanel-icon" :class="`tone-${props.tone}`" aria-hidden="true"><slot name="icon" /></span>
      <div class="rpanel-title">
        <h3>{{ title }}</h3>
        <slot name="sub" />
      </div>
      <slot name="aside" />
      <button
        v-if="collapsible"
        type="button"
        class="rpanel-toggle"
        :aria-expanded="open"
        :aria-controls="bodyId"
        :aria-label="`${open ? 'Collapse' : 'Expand'} ${title}`"
        @click="open = !open"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
      </button>
    </header>
    <div v-show="open" :id="bodyId" class="rpanel-body"><slot /></div>
  </section>
</template>
