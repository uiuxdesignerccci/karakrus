<script setup lang="ts">
import type { AdminOverview, AuditActorKind, AuditRecord } from '~/types'

definePageMeta({ layout: 'admin', adminTitle: 'Audit Trail' })

const headers = useRequestHeaders(['cookie'])
const { data } = await useFetch<{ records: AuditRecord[] }>('/api/admin/audit', { headers })
const { data: overview } = await useFetch<AdminOverview>('/api/admin/overview', { headers })

const ACTOR_LABEL: Record<AuditActorKind, string> = {
  staff: 'Staff', player: 'Player', detector: 'AI detector', system: 'System', unauthenticated: 'Unauthenticated',
}
const PAGE_SIZE = 10

const blank = () => ({ q: '', outcome: '', room: '', actorKind: '', from: '', to: '' })
const draft = reactive(blank())
const applied = ref(blank())
const page = ref(1)

function apply() { applied.value = { ...draft }; page.value = 1 }
function reset() { Object.assign(draft, blank()); apply() }

/** yyyy-mm-dd of a timestamp in Asia/Manila, for the date-range filter. */
const manilaDay = (ts: number) => new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })

const filtered = computed(() => {
  const f = applied.value
  const term = f.q.trim().toLowerCase()
  return (data.value?.records ?? []).filter((r) => {
    const day = manilaDay(r.created_at)
    return (!term || `${r.actor} ${r.action} ${r.target}`.toLowerCase().includes(term))
      && (!f.outcome || r.outcome === f.outcome)
      && (!f.room || String(r.room_id) === f.room)
      && (!f.actorKind || r.actorKind === f.actorKind)
      && (!f.from || day >= f.from)
      && (!f.to || day <= f.to)
  })
})
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const rows = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

function exportCsv() {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = [['Time (Asia/Manila)', 'Actor', 'Actor type', 'Action', 'Target', 'Outcome'].join(',')]
  for (const r of filtered.value) lines.push([formatManila(r.created_at), r.actor, ACTOR_LABEL[r.actorKind], r.action, r.target, r.outcome].map(esc).join(','))
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `audit-trail-${manilaDay(Date.now())}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

useHead({ title: 'Audit Trail · Kara Krus Admin' })
</script>

<template>
  <div>
    <header class="room-head">
      <div>
        <p class="eyebrow">OPERATOR ACTIVITY</p>
        <h1 class="page-title">Audit Trail</h1>
        <p class="muted">Review administrative actions, outcomes, and who performed them.</p>
      </div>
      <button type="button" class="btn btn-ghost" @click="exportCsv">Export CSV</button>
    </header>

    <section class="card">
      <header class="card-intro">
        <div><h3>Audit records</h3><p class="muted">Every administrative action, who performed it and how it turned out.</p></div>
        <span class="tag tag-accent">{{ filtered.length }} records</span>
      </header>
      <form class="admin-filters" @submit.prevent="apply">
        <label class="grow">Search activity<input v-model="draft.q" class="search" placeholder="Actor, action or target"></label>
        <label>Outcome
          <select v-model="draft.outcome">
            <option value="">All outcomes</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label>Room
          <select v-model="draft.room">
            <option value="">All rooms</option>
            <option v-for="r in overview?.rooms" :key="r.id" :value="String(r.id)">{{ r.name }}</option>
          </select>
        </label>
        <label>Actor type
          <select v-model="draft.actorKind">
            <option value="">All actor types</option>
            <option v-for="(label, k) in ACTOR_LABEL" :key="k" :value="k">{{ label }}</option>
          </select>
        </label>
        <label>From date<input v-model="draft.from" type="date" class="search"></label>
        <label>To date<input v-model="draft.to" type="date" class="search"></label>
        <div class="filter-actions">
          <button type="submit" class="btn btn-gold small">Apply filters</button>
          <button type="button" class="btn btn-ghost small" @click="reset">Reset filters</button>
        </div>
      </form>

      <div class="table-wrap">
        <table class="bets">
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Outcome</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td><time :datetime="new Date(r.created_at).toISOString()">{{ formatManila(r.created_at) }}</time></td>
              <td><b>{{ r.actor }}</b><br><small class="muted">{{ ACTOR_LABEL[r.actorKind] }}</small></td>
              <td>{{ r.action }}</td>
              <td>{{ r.target || 'Account / portal' }}</td>
              <td><span class="tag" :class="r.outcome === 'succeeded' ? 'tag-ok' : 'tag-bad'">{{ r.outcome === 'succeeded' ? 'Succeeded' : 'Failed' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!rows.length" class="muted empty">No recorded activity matches.</p>
      <nav v-if="pages > 1" class="pager" aria-label="Audit pages">
        <button type="button" class="btn btn-ghost small" :disabled="page === 1" @click="page--">Previous</button>
        <span class="muted">Page {{ page }} of {{ pages }}</span>
        <button type="button" class="btn btn-ghost small" :disabled="page === pages" @click="page++">Next</button>
      </nav>
      <p class="fine card-foot">Export includes all records matching the applied filters, across all pages. Times shown in Asia/Manila. 10 records per page.</p>
    </section>
  </div>
</template>
