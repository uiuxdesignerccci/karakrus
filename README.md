# Kara Krus (Nuxt 3 + TypeScript)

Rebuild of https://kara-krus.beespokedev.com.

```
npm install
npm run dev      # http://localhost:3000
npm run typecheck
```

Dev accounts (seeded in `server/utils/db.ts`): `player / MidnightPlayer123!`, `admin / MidnightAdmin123!`.

## Routes

| Route | File |
|---|---|
| `/` | `pages/index.vue` |
| `/login`, `/register` | `pages/login.vue`, `pages/register.vue` (layout `auth`) |
| `/lobby` | `pages/lobby.vue` |
| `/rooms/:id` | `pages/rooms/[id].vue` |
| `/invitations` | `pages/invitations.vue` |
| `/admin/login` | `pages/admin/login.vue` (layout `auth`) |
| `/admin` | `pages/admin/index.vue` (layout `admin`) |
| `/admin/rooms` | `pages/admin/rooms/index.vue` |
| `/admin/rooms/:id` | `pages/admin/rooms/[id].vue` (host controls, streaming, settle round) |
| `/admin/players` | `pages/admin/players.vue` (metrics, filters, details, block / unblock) |
| `/admin/staff` | `pages/admin/staff.vue` (create, edit, role, rooms, password reset, deactivate) |
| `/admin/roles` | `pages/admin/roles.vue` (roles and permissions; Super Admin is protected) |
| `/admin/audit` | `pages/admin/audit.vue` (filters, 10 per page, CSV export) |
| `/admin/sessions` | `pages/admin/sessions.vue` (session history for staff and players) |
| `/admin/settings` | `pages/admin/settings.vue` (announcement, password, game config) |

"How to play" / "Rules & payouts" is a modal (`components/HowToPlayModal.vue`), not a route.

## Notes

- Amounts are centi-credits (100 = 1 CR), matching the original API.
- `server/api/*` is an in-memory mock of the original `/api/*` endpoints, so state resets on restart.
- Not yet implemented: live video (WHEP playback), realtime events (`/api/events` — pages poll instead), VIP invitations and
  chat muting (the muted-players list is a static empty state).
- Admin pages were rebuilt from read-only views of the live admin console; nothing was created, edited or saved there.
