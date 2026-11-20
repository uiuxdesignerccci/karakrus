<script setup lang="ts">
import type { Side } from '~/types'

withDefaults(defineProps<{ side: Side; size?: number }>(), { size: 120 })
</script>

<template>
  <svg class="coin" :class="`coin-${side}`" :viewBox="'0 0 120 120'" :width="size" :height="size" role="img" :aria-label="side === 'kara' ? 'Kara coin' : 'Krus coin'">
    <defs>
      <radialGradient :id="`g-${side}`" cx="35%" cy="30%" r="80%">
        <stop offset="0" :stop-color="side === 'kara' ? '#f1d794' : '#a5d4c7'" />
        <stop offset="1" :stop-color="side === 'kara' ? '#b88f3c' : '#4a8878'" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="64" r="54" :fill="side === 'kara' ? '#8a6a28' : '#34695b'" />
    <circle cx="60" cy="58" r="54" :fill="`url(#g-${side})`" />
    <circle cx="60" cy="58" r="44" fill="none" stroke="#0d141e" stroke-opacity=".25" />
    <g v-if="side === 'kara'" stroke="#0d141e" stroke-opacity=".45" stroke-width="3" stroke-linecap="round">
      <circle cx="60" cy="58" r="10" fill="none" />
      <path v-for="a in 8" :key="a" :transform="`rotate(${a * 45} 60 58)`" d="M60 40v-8" />
    </g>
    <g v-else stroke="#0d141e" stroke-opacity=".45" stroke-width="5" stroke-linecap="round">
      <path d="M60 40v36M42 58h36" />
    </g>
  </svg>
</template>
