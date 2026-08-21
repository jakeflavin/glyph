import { useEffect } from 'react'
import { usePersistentState } from './usePersistentState'

export type Theme = 'light' | 'dark' | 'system'

export const THEMES: [Theme, ...Theme[]] = ['light', 'dark', 'system']

export function useTheme() {
  const [theme, setTheme] = usePersistentState<Theme>('glyph.theme', 'system')

  // The resolved theme lives on <html> so CSS switches tokens without a re-render, and is
  // recomputed when the OS preference changes while 'system' is selected.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = resolved
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', resolved === 'dark' ? '#0d0d0d' : '#ffffff')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return { theme, setTheme }
}
