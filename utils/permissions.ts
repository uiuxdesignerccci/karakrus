/** Permission keys grouped by area, mirroring the live console's role editor. */
export const PERMISSION_GROUPS: Record<string, string> = {
  dashboard: 'Dashboard',
  audit: 'Audit trail',
  rooms: 'Rooms',
  rounds: 'Game controls',
  streams: 'Player stream',
  staff_streams: 'Staff stream',
  players: 'Players',
  invitations: 'VIP invitations',
  chat: 'Chat',
  settings: 'Settings',
  staff: 'Staff accounts',
  roles: 'Roles',
}

export const PERMISSIONS: Record<string, string> = {
  'dashboard.view': 'View dashboard',
  'audit.view': 'View audit trail',
  'audit.export': 'Export audit trail',
  'rooms.view': 'View rooms',
  'rooms.create': 'Create rooms',
  'rooms.update': 'Edit rooms',
  'rounds.start': 'Open betting',
  'rounds.settle': 'Settle rounds',
  'streams.update': 'Manage player stream',
  'staff_streams.update': 'Manage staff stream',
  'players.view': 'View players',
  'players.set_status': 'Block / unblock players',
  'players.end_sessions': 'End player sessions',
  'invitations.manage': 'Manage invitations',
  'chat.moderate': 'Moderate chat',
  'settings.update': 'Edit settings',
  'staff.view': 'View staff',
  'staff.create': 'Create staff',
  'staff.update': 'Edit staff',
  'staff.assign_role': 'Change staff role',
  'staff.assign_rooms': 'Assign rooms',
  'staff.reset_password': 'Reset staff password',
  'staff.set_status': 'Deactivate staff',
  'roles.view': 'View roles',
  'roles.create': 'Create roles',
  'roles.update': 'Edit roles',
  'roles.delete': 'Delete roles',
}

export const SESSION_END_LABEL: Record<string, string> = {
  logout: 'Signed out',
  replaced: 'Replaced by a new sign-in',
  revoked: 'Session ended',
  password_changed: 'Password changed',
  password_reset: 'Password reset',
  deactivated: 'Account deactivated',
  expired: 'Expired',
}

export function formatManila(ts: number) {
  return new Date(ts).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })
}
