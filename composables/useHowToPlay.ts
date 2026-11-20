export function useHowToPlay() {
  const open = useState<boolean>('howToPlay:open', () => false)
  return {
    open,
    show: () => (open.value = true),
    hide: () => (open.value = false),
  }
}
