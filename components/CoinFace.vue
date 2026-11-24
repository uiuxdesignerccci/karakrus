<script setup lang="ts">
import type { Side } from '~/types'

withDefaults(defineProps<{ side: Side; size?: number }>(), { size: 120 })
</script>

<template>
  <svg class="coin" :class="`coin-${side}`" :viewBox="'0 0 120 120'" :width="size" :height="size" role="img" :aria-label="side === 'kara' ? 'Kara coin' : 'Krus coin'">
    <defs>
      <radialGradient :id="`g-${side}`" cx="35%" cy="30%" r="80%">
        <stop offset="0" :stop-color="side === 'kara' ? '#ffe8a3' : '#c4e2ff'" />
        <stop offset="1" :stop-color="side === 'kara' ? '#ff9a1f' : '#2f7cf6'" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="64" r="54" :fill="side === 'kara' ? '#c86400' : '#1a4fb5'" />
    <circle cx="60" cy="58" r="54" :fill="`url(#g-${side})`" />
    <circle cx="60" cy="58" r="52" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" />
    <circle cx="60" cy="58" r="44" fill="none" stroke="#120b2a" stroke-opacity=".25" stroke-width="2" stroke-dasharray="2 4" />
    <g v-if="side === 'kara'" stroke="#5a2a00" stroke-opacity=".5" stroke-width="3" stroke-linecap="round">
      <circle cx="60" cy="58" r="10" fill="none" />
      <path v-for="a in 8" :key="a" :transform="`rotate(${a * 45} 60 58)`" d="M60 40v-8" />
    </g>
    <g v-else stroke="#0b2a66" stroke-opacity=".5" stroke-width="5" stroke-linecap="round">
      <path d="M60 40v36M42 58h36" />
    </g>
  </svg>
</template>
