<script setup lang="ts">
const { open, hide } = useHowToPlay()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') hide()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="hide">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="how-title">
        <div class="modal-coins">
          <CoinFace side="kara" :size="72" />
          <CoinFace side="krus" :size="72" />
        </div>
        <h2 id="how-title">One coin. Here’s how it works.</h2>
        <ol class="rules">
          <li>Join a room and wait for the host to open betting.</li>
          <li>Choose Kara or Krus and place credits before the countdown ends. You can place multiple bets on either side.</li>
          <li>Betting closes automatically. Watch the host’s single coin toss; the host confirms its result.</li>
          <li>The winning side shares 95% of the total pool, in proportion to each bet.</li>
        </ol>
        <p class="formula">Your return = (your bet ÷ winning-side pool)<br>× (total pool × 0.95)</p>
        <p class="muted">Example: a 100-credit winning bet in a 500-credit winning pool, with 1,000 credits total, returns 190 credits including your stake. Returns change until betting closes.</p>
        <p class="muted">A 5% fee is deducted once per round. Fractions are allocated to the nearest 0.01 credit using largest remainders. If nobody bets on the winning side, all bets are refunded with no fee.</p>
        <p class="muted">Breaks happen between rounds. A “Final round” banner appears before betting opens for the last game. These are virtual demo credits with no cash value.</p>
        <button type="button" class="btn btn-gold" @click="hide">Got it</button>
      </div>
    </div>
  </Teleport>
</template>
