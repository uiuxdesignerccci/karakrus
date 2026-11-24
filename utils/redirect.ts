/** Where to go after signing in: an internal path from `?redirect=`, else the lobby. */
export function safeRedirect(target: unknown, fallback = '/lobby'): string {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\') ? target : fallback
}
