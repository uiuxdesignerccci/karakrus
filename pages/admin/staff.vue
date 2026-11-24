<script setup lang="ts">
import type { AdminOverview, StaffAccount, StaffRole } from '~/types'

definePageMeta({ layout: 'admin', adminTitle: 'Staff' })

type Mode = 'create' | 'profile' | 'role' | 'rooms' | 'password' | 'status'

const headers = useRequestHeaders(['cookie'])
const { data, refresh } = await useFetch<{ staff: StaffAccount[]; roles: StaffRole[] }>('/api/admin/staff', { headers })
const { data: overview } = await useFetch<AdminOverview>('/api/admin/overview', { headers })
const rooms = computed(() => overview.value?.rooms ?? [])
const roomName = (id: number) => rooms.value.find((r) => r.id === id)?.name ?? `Room #${id}`

const q = ref('')
const staff = computed(() => {
  const term = q.value.trim().toLowerCase()
  return (data.value?.staff ?? []).filter((s) => !term || `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(term))
})

const TITLES: Record<Mode, string> = {
  create: 'Create staff account',
  profile: 'Edit staff account',
  role: 'Change staff role',
  rooms: 'Assign rooms',
  password: 'Reset staff password',
  status: '',
}

const editor = ref<{ mode: Mode; target: StaffAccount | null } | null>(null)
const form = reactive({ firstName: '', lastName: '', email: '', password: '', roleId: 0, roomIds: [] as number[] })
const error = ref('')
const busy = ref(false)
const flash = ref('')

function open(mode: Mode, target: StaffAccount | null = null) {
  Object.assign(form, {
    firstName: target?.firstName ?? '', lastName: target?.lastName ?? '', email: target?.email ?? '',
    password: '', roleId: target?.role?.id ?? 0, roomIds: [...(target?.roomIds ?? [])],
  })
  error.value = ''
  editor.value = { mode, target }
}

const editorTitle = computed(() => {
  const e = editor.value
  if (!e) return ''
  if (e.mode === 'status') return e.target?.active ? 'Deactivate staff account?' : 'Reactivate staff account?'
  return TITLES[e.mode]
})

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  const bytes = crypto.getRandomValues(new Uint32Array(16))
  form.password = Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function toggleRoom(id: number, on: boolean) {
  form.roomIds = on ? [...form.roomIds, id] : form.roomIds.filter((r) => r !== id)
}

async function save() {
  const e = editor.value!
  const body = e.mode === 'create' ? { ...form }
    : e.mode === 'profile' ? { firstName: form.firstName, lastName: form.lastName, email: form.email }
      : e.mode === 'role' ? { roleId: form.roleId }
        : e.mode === 'rooms' ? { roomIds: form.roomIds }
          : e.mode === 'password' ? { password: form.password }
            : { active: !e.target!.active }
  busy.value = true
  error.value = ''
  try {
    const url: string = e.mode === 'create' ? '/api/admin/staff' : `/api/admin/staff/${e.target!.id}`
    await $fetch(url, { method: e.mode === 'create' ? 'POST' : 'PUT', body })
    flash.value = e.mode === 'create' ? 'Staff account created.' : 'Staff account updated.'
    editor.value = null
    await refresh()
  } catch (err) {
    error.value = (err as { statusMessage?: string }).statusMessage ?? 'Could not save the staff account'
  } finally {
    busy.value = false
  }
}

/** Row "more actions" menu: one open at a time, closed by outside click or Escape. */
const menuFor = ref<number | null>(null)
function pick(mode: Mode, target: StaffAccount) {
  menuFor.value = null
  open(mode, target)
}
const closeMenu = () => (menuFor.value = null)
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
onMounted(() => {
  document.addEventListener('click', closeMenu)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu)
  document.removeEventListener('keydown', onKey)
})

useHead({ title: 'Staff · Kara Krus Admin' })
</script>

<template>
  <div>
    <header class="room-head">
      <div>
        <p class="eyebrow">YOUR TEAM</p>
        <h1 class="page-title">Staff accounts</h1>
        <p class="muted">Manage roles, room assignments, and account access.</p>
      </div>
      <button type="button" class="btn btn-gold" @click="open('create')">Create staff account</button>
    </header>

    <p v-if="flash" class="admin-flash" role="status">{{ flash }}</p>

    <section class="card">
      <header class="card-intro">
        <div><h3>Team members</h3><p class="muted">Everyone with access to the staff portal, with their role and assigned rooms.</p></div>
        <span class="tag tag-accent">{{ staff.length }} members</span>
      </header>
      <form class="admin-filters" @submit.prevent>
        <label class="grow">Search staff<input v-model="q" class="search" placeholder="Name or email"></label>
      </form>
      <ul class="staff-list">
        <li v-for="s in staff" :key="s.id" class="staff-row">
          <div class="staff-id">
            <span class="avatar" aria-hidden="true">{{ s.firstName[0] }}{{ s.lastName[0] }}</span>
            <div>
              <b>{{ s.firstName }} {{ s.lastName }}</b>
              <small class="muted">{{ s.email }}</small>
            </div>
          </div>
          <div class="staff-meta">
            <span class="tag" :class="s.isSuperAdmin ? 'tag-accent' : ''">{{ s.isSuperAdmin ? 'Super Admin' : s.role?.name ?? 'No role' }}</span>
            <span class="tag" :class="s.active ? 'tag-ok' : 'tag-bad'">{{ s.active ? 'Active' : 'Inactive' }}</span>
            <small class="muted">
              {{ s.isSuperAdmin ? 'All rooms · Protected account' : s.roomIds.length ? s.roomIds.map(roomName).join(', ') : 'No rooms assigned' }}
            </small>
          </div>
          <div v-if="s.isSuperAdmin" aria-hidden="true" />
          <div v-else class="actions">
            <button type="button" class="btn btn-ghost small" @click="open('profile', s)">Edit</button>
            <div class="menu-wrap">
              <button
                type="button"
                class="btn btn-ghost small menu-trigger"
                aria-haspopup="menu"
                :aria-expanded="menuFor === s.id"
                :aria-label="`More actions for ${s.firstName} ${s.lastName}`"
                @click.stop="menuFor = menuFor === s.id ? null : s.id"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2.4" /><circle cx="12" cy="12" r="2.4" /><circle cx="19" cy="12" r="2.4" /></svg>
              </button>
              <div v-if="menuFor === s.id" class="row-menu" role="menu" @click.stop>
                <button type="button" role="menuitem" @click="pick('rooms', s)">Assign rooms</button>
                <button type="button" role="menuitem" @click="pick('role', s)">Change role</button>
                <button type="button" role="menuitem" @click="pick('password', s)">Reset password</button>
                <hr>
                <button type="button" role="menuitem" :class="{ danger: s.active }" @click="pick('status', s)">{{ s.active ? 'Deactivate account' : 'Reactivate account' }}</button>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <p v-if="!staff.length" class="muted empty">No staff accounts found.</p>
    </section>

    <AdminModal
      v-if="editor"
      :title="editorTitle"
      :description="editor.target ? `${editor.target.firstName} ${editor.target.lastName} · ${editor.target.email}` : 'Use email and password to sign in to the staff portal.'"
      @close="editor = null"
    >
      <form id="staff-form" class="form" @submit.prevent="save">
        <template v-if="editor.mode === 'create' || editor.mode === 'profile'">
          <div class="row">
            <label><span>First name <span class="req">*</span></span><input v-model="form.firstName" autocomplete="given-name" maxlength="200" required></label>
            <label><span>Last name <span class="req">*</span></span><input v-model="form.lastName" autocomplete="family-name" maxlength="200" required></label>
          </div>
          <label><span>Email address <span class="req">*</span></span><input v-model="form.email" type="email" autocomplete="email" maxlength="200" required></label>
        </template>
        <label v-if="editor.mode === 'create' || editor.mode === 'role'"><span>Role <span class="req">*</span></span>
          <select v-model.number="form.roleId" aria-label="Role" required>
            <option :value="0" disabled>Choose a role</option>
            <option v-for="r in data?.roles" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </label>
        <label v-if="editor.mode === 'create' || editor.mode === 'password'">
          <span class="label-row"><span>Password <span class="req">*</span></span><button type="button" class="link-btn" @click="generatePassword">Generate strong password</button></span>
          <input v-model="form.password" type="text" autocomplete="new-password" minlength="10" maxlength="200" required>
          <small class="muted">At least 10 characters. Do not include the first or last name.</small>
        </label>
        <fieldset v-if="editor.mode === 'create' || editor.mode === 'rooms'" class="check-grid">
          <legend>Assigned rooms</legend>
          <p class="muted">Only selected rooms are accessible.</p>
          <label v-for="r in rooms" :key="r.id" class="check">
            <input type="checkbox" :checked="form.roomIds.includes(r.id)" @change="toggleRoom(r.id, ($event.target as HTMLInputElement).checked)">
            {{ r.name }}
          </label>
          <p v-if="!rooms.length" class="muted">No rooms available to assign.</p>
        </fieldset>
        <p v-if="editor.mode === 'status'" class="muted">
          {{ editor.target?.active ? 'This account will be signed out and unable to sign in until reactivated.' : 'This account can sign in again with its existing role and room assignments.' }}
        </p>
        <p v-if="editor.mode === 'password'" class="muted">Existing sessions will be signed out. Share the new password securely.</p>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      </form>
      <template #actions>
        <button type="button" class="btn btn-ghost" :disabled="busy" @click="editor = null">Cancel</button>
        <button type="submit" form="staff-form" class="btn" :class="editor.mode === 'status' && editor.target?.active ? 'btn-danger' : 'btn-gold'" :disabled="busy">
          {{ editor.mode === 'create' ? 'Create account' : editor.mode === 'status' ? 'Confirm' : 'Save changes' }}
        </button>
      </template>
    </AdminModal>
  </div>
</template>
