<script setup lang="ts">
import type { Room } from '~/types'

const { user } = useAuth()
const { show } = useHowToPlay()

const { data } = await useFetch<{ rooms: Room[] }>('/api/rooms', {
  headers: useRequestHeaders(['cookie']),
  default: () => ({ rooms: [] }),
})
const rooms = computed(() => data.value?.rooms ?? [])
const featured = computed(() => rooms.value.slice(0, 3))
const taking = computed(() => rooms.value.filter((r) => r.status === 'open').length)
const inPlay = computed(() => rooms.value.reduce((n, r) => n + r.pool_kara + r.pool_krus, 0))

const steps = [
  { n: '01', title: 'Find your room', body: 'Take a seat with other players at a table that feels right.' }
  ,
  { n: '02', title: 'Make your call', body: 'Kara or Krus? Place your demo credits before the timer ends.' },
  { n: '03', title: 'Watch the moment', body: 'One live toss. The host confirms. Winners share the pool.' },
]

useHead({ title: 'Kara Krus · The live coin club' })
</script>

<template>
  <div>
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><i class="live-dot" /> THE LIVE COIN CLUB</p>
        <h1>One coin.<br>Two sides.<br><em>Your call.</em></h1>
        <p class="lede">A classic Filipino game. A whole new atmosphere.<br>Pick your side, feel the moment, and watch it flip.</p>
        <div class="hero-cta">
          <NuxtLink :to="user ? '/lobby' : '/login'" class="btn btn-gold">Take a seat</NuxtLink>
          <button type="button" class="btn btn-ghost" @click="show">▷ How it works</button>
        </div>
        <p class="hero-people"><span class="avatars"><i>A</i><i>M</i><i>J</i></span> Made for the moment.<br>Better with a room full of people.</p>
      </div>
      <div class="hero-art" aria-hidden="true">
        <p class="hero-note">THE ODDS ARE A FEELING.</p>
        <CoinFace side="kara" :size="280" class="hero-coin-a" />
        <CoinFace side="krus" :size="220" class="hero-coin-b" />
        <span class="hero-ribbon">✦ ONE TOSS. ENDLESS POSSIBILITIES.</span>
        <small class="hero-cap">01 / THE ORIGINAL COIN TOSS</small>
      </div>
      <div class="hero-foot">
        <span>INSTINCT MEETS POSSIBILITY</span><span>EXPLORE THE CLUB ⌄</span><span>EST. 2026 · PILIPINAS</span>
      </div>
    </section>

    <section class="stats-strip">
      <div><b>{{ String(taking).padStart(2, '0') }}</b><span>Rooms taking bets</span></div>
      <div><b>{{ String(rooms.length || 4).padStart(2, '0') }}</b><span>Tables to discover</span></div>
      <div><b>{{ formatCredits(inPlay) }} CR</b><span>On the tables this round</span></div>
      <p>One coin. A clear result.<br>95% of the pool goes to the winners.</p>
    </section>

    <section class="section">
      <p class="eyebrow">FIND YOUR TABLE</p>
      <div class="section-head">
        <div><h2>Good company. Great calls.</h2><p class="muted">Different rooms. The same electric moment.</p></div>
        <NuxtLink to="/lobby" class="btn btn-ghost">Explore the lobby</NuxtLink>
      </div>
      <div class="room-grid">
        <RoomCard v-for="r in featured" :key="r.id" :room="r" />
      </div>
    </section>

    <section class="section how">
      <p class="eyebrow">NOTHING COMPLICATED. JUST A COIN.</p>
      <div class="section-head">
        <h2>Trust your instinct.<br>Enjoy the flip.</h2>
        <button type="button" class="btn btn-ghost" @click="show">Know the game</button>
      </div>
      <ol class="steps">
        <li v-for="s in steps" :key="s.n"><b>{{ s.n }}</b><h3>{{ s.title }}</h3><p class="muted">{{ s.body }}</p></li>
      </ol>
    </section>

    <section class="cta-band">
      <p class="eyebrow">THERE’S A SEAT WITH YOUR NAME ON IT</p>
      <h2>The next flip could be your moment.</h2>
      <NuxtLink :to="user ? '/lobby' : '/login'" class="btn btn-gold">Enter the club</NuxtLink>
    </section>
  </div>
</template>
