<script setup lang="ts">
import type { StaffRole } from '~/types'

definePageMeta({ layout: 'admin', adminTitle: 'Roles' })

type RoleRow = StaffRole & { staffCount: number }
const { data, refresh } = await useFetch<{ roles: RoleRow[] }>('/api/admin/roles', { headers: useRequestHeaders(['cookie']) })

const groups = Object.entries(PERMISSION_GROUPS).map(([key, label]) => ({
  key, label, perms: Object.keys(PERMISSIONS).filter((p) => p.startsWith(`${key}.`)),
}))

const editing = ref<{ id: number; name: string; permissions: string[] } | null>(null)
const deleting = ref<RoleRow | null>(null)
const busy = ref(false)
const error = ref('')
const flash = ref('')

function edit(role?: StaffRole) {
  error.value = ''
  editing.value = { id: role?.id ?? 0, name: role?.name ?? '', permissions: [...(role?.permissions ?? [])] }
}

function toggle(p: string, on: boolean) {
  const e = editing.value!
  e.permissions = on ? [...e.permissions, p] : e.permissions.filter((x) => x !== p)
}

async function run(fn: () => Promise<unknown>, done: string) {
  busy.value = true
  error.value = ''
  try {
    await fn()
    flash.value = done
    editing.value = null
    deleting.value = null
    await refresh()
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage ?? 'Something went wrong'
  } finally {
    busy.value = false
  }
}

const save = () => {
  const e = editing.value!
  const url: string = e.id ? `/api/admin/roles/${e.id}` : '/api/admin/roles'
  return run(() => $fetch<unknown>(url, { method: e.id ? 'PUT' : 'POST', body: { name: e.name, permissions: e.permissions } }), 'Role saved.')
}
const remove = () => {
  const url: string = `/api/admin/roles/${deleting.value!.id}`
  return run(() => $fetch<unknown>(url, { method: 'DELETE' }), 'Role deleted.')
}

useHead({ title: 'Roles · Kara Krus Admin' })
</script>

<template>
  <div>
    <header class="room-head">
      <div>
        <p class="eyebrow">ACCESS CONTROL</p>
        <h1 class="page-title">Roles and permissions</h1>
        <p class="muted">Choose room access and platform management permissions for each role.</p>
      </div>
      <button type="button" class="btn btn-gold" @click="edit()">Create role</button>
    </header>

    <p v-if="flash" class="admin-flash" role="status">{{ flash }}</p>

    <section class="card role-card role-protected">
      <span class="avatar" aria-hidden="true">★</span>
      <div>
        <h3>Super Admin</h3>
        <p class="muted">All permissions and all rooms. This role is protected.</p>
      </div>
      <span class="tag tag-accent">Protected</span>
    </section>

    <section v-for="r in data?.roles" :key="r.id" class="card role-card">
      <header class="card-head">
        <h3>{{ r.name }} <span class="tag">{{ r.permissions.length }} permissions</span></h3>
        <div class="actions">
          <button type="button" class="btn btn-ghost small" @click="edit(r)">Edit role</button>
          <button type="button" class="btn btn-ghost small" @click="deleting = r; error = ''">Delete role</button>
        </div>
      </header>
      <div class="perm-chips">
        <span v-for="p in r.permissions" :key="p" class="tag">{{ PERMISSIONS[p] ?? p }}</span>
        <span v-if="!r.permissions.length" class="muted">No permissions assigned.</span>
      </div>
      <small class="muted">{{ r.staffCount }} staff assigned</small>
    </section>

    <AdminModal
      v-if="editing"
      :title="editing.id ? 'Edit role' : 'Create role'"
      description="Staff need room viewing and the relevant action permissions. Choose list permissions to make management screens available."
      @close="editing = null"
    >
      <form id="role-form" class="form" @submit.prevent="save">
        <label><span>Role name <span class="req">*</span></span><input v-model="editing.name" maxlength="60" required></label>
        <fieldset v-for="g in groups" :key="g.key" class="check-grid">
          <legend>{{ g.label }}</legend>
          <p v-if="g.key === 'players'" class="muted">Player management applies to all players. Blocking and ending sessions also require the player viewing permission.</p>
          <label v-for="p in g.perms" :key="p" class="check">
            <input type="checkbox" :checked="editing.permissions.includes(p)" @change="toggle(p, ($event.target as HTMLInputElement).checked)">
            <span>{{ PERMISSIONS[p] }} <small class="muted">{{ p }}</small></span>
          </label>
        </fieldset>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      </form>
      <template #actions>
        <button type="button" class="btn btn-ghost" :disabled="busy" @click="editing = null">Cancel</button>
        <button type="submit" form="role-form" class="btn btn-gold" :disabled="busy">Save role</button>
      </template>
    </AdminModal>

    <AdminModal v-if="deleting" title="Delete role?" :description="`“${deleting.name}” will be removed. Only roles without assigned staff can be deleted.`" @close="deleting = null">
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <template #actions>
        <button type="button" class="btn btn-ghost" :disabled="busy" @click="deleting = null">Cancel</button>
        <button type="button" class="btn btn-danger" :disabled="busy" @click="remove">Confirm deletion</button>
      </template>
    </AdminModal>
  </div>
</template>
