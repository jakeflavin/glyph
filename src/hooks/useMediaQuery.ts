import { useSyncExternalStore } from 'react'

/**
 * A media query as React state.
 *
 * Used to *move* a control rather than to duplicate it: rendering a desktop copy and a
 * phone copy and hiding one with CSS puts two controls with the same accessible name in
 * the tree, which is worse for a screen reader than either layout alone.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** The point the two-column layout stacks, shared so the JS and the styles cannot drift. */
export const STACKED = '(max-width: 900px)'
