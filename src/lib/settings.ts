import { EMPTY_DRAFT, KINDS, type Draft } from './payloads'
import type { Style } from './render'

export const DEFAULT_STYLE: Style = {
  shape: 'square',
  eyeShape: 'square',
  margin: 4,
  dark: '#000000',
  light: '#ffffff',
  eye: null,
  logo: null,
  caption: '',
}

/**
 * Reading back what an older build of this app wrote.
 *
 * Both of these are `usePersistentState` decoders, and both exist for the same reason: a
 * stored object is missing whatever has been added since it was written, and every field
 * in it is read as a controlled input's value. A missing one turns a controlled input
 * uncontrolled, which silently drops what is typed into it.
 */
export function readDraft(raw: string | null): Draft {
  if (!raw) return EMPTY_DRAFT
  try {
    const stored = JSON.parse(raw) as Partial<Draft>
    const merged = { ...EMPTY_DRAFT }
    for (const kind of KINDS) {
      const saved = stored[kind.id]
      if (saved) Object.assign(merged[kind.id], saved)
    }
    return merged
  } catch {
    return EMPTY_DRAFT
  }
}

/** What the first build stored in place of a pair of colours. */
interface LegacyStyle {
  invert?: boolean
}

export function readStyle(raw: string | null): Style {
  if (!raw) return DEFAULT_STYLE
  try {
    const { invert, ...stored } = JSON.parse(raw) as Partial<Style> & LegacyStyle
    const merged: Style = { ...DEFAULT_STYLE, ...stored }

    // The first build had one `invert` flag where there are now two colours. A stored
    // `true` means the pair was the other way round. The flag is dropped rather than
    // carried: leaving it in the object it writes back would have it read for ever.
    if (invert && !stored.dark) {
      merged.dark = DEFAULT_STYLE.light
      merged.light = DEFAULT_STYLE.dark
    }
    return merged
  } catch {
    return DEFAULT_STYLE
  }
}
