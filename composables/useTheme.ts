export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'kk-theme'

/**
 * Light/dark theme. The `dark` class on <html> drives the CSS; an inline script in
 * nuxt.config.ts applies the saved (or system) choice before first paint, and this
 * composable syncs with it after hydration.
 */
export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light')

  function apply(next: Theme) {
    theme.value = next
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#110b2b' : '#f4f0ff')
  }

  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    apply(next)
    try { localStorage.setItem(THEME_STORAGE_KEY, next) } catch { /* storage unavailable */ }
  }

  onMounted(() => {
    theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  return { theme, toggle }
}
