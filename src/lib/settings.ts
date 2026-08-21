import { EMPTY_DRAFT, KINDS, type Draft } from './payloads'
import { solid, type Paint } from './paint'
import type { Style } from './render'

export const DEFAULT_STYLE: Style = {
  module: 'square',
  eyeFrame: 'square',
  eyeBall: 'square',
  margin: 4,
  paint: solid('#000000'),
  background: solid('#ffffff'),
  transparent: false,
  round: 0,
  eyeFramePaint: null,
  eyeBallPaint: null,
  logo: null,
  frame: { style: 'none', caption: '', position: 'below' },
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

/**
 * What earlier builds stored in place of the current style.
 *
 * The first had one `invert` flag rather than a pair of colours. The second had a pair of
 * hex strings, one shape for both parts of a finder pattern, and a bare caption. Both are
 * still on people's machines, so both are still read.
 */
interface LegacyStyle {
  invert?: boolean
  dark?: string
  light?: string
  eye?: string | null
  shape?: string
  eyeShape?: string
  caption?: string
}

const LEGACY_MODULES: Record<string, Style['module']> = {
  square: 'square',
  rounded: 'rounded',
  dot: 'dot',
}

const LEGACY_EYES: Record<string, [Style['eyeFrame'], Style['eyeBall']]> = {
  square: ['square', 'square'],
  rounded: ['rounded', 'rounded'],
  circle: ['circle', 'circle'],
}

export function readStyle(raw: string | null): Style {
  if (!raw) return DEFAULT_STYLE
  try {
    const stored = JSON.parse(raw) as Partial<Style> & LegacyStyle
    const legacy = migrate(stored)
    return {
      ...DEFAULT_STYLE,
      ...legacy,
      // Nested objects merge rather than replace, for the same reason the whole thing does.
      frame: { ...DEFAULT_STYLE.frame, ...legacy.frame },
      logo: legacy.logo ? { ...EMPTY_LOGO, ...legacy.logo } : null,
    }
  } catch {
    return DEFAULT_STYLE
  }
}

const EMPTY_LOGO = { src: '', scale: 0.2, margin: 0.5, knockout: true, round: false }

function migrate(stored: Partial<Style> & LegacyStyle): Partial<Style> {
  const { invert, dark, light, eye, shape, eyeShape, caption, ...current } = stored

  // Nothing to carry: this was written by a build that already had the current shape.
  if (!invert && !dark && !light && !shape && !eyeShape && !caption) return current

  const out: Partial<Style> = { ...current }

  if (invert && !dark) {
    out.paint = solid('#ffffff')
    out.background = solid('#000000')
  }
  if (dark) out.paint = solid(dark)
  if (light) out.background = solid(light)
  if (eye) out.eyeFramePaint = solid(eye)

  const module = shape ? LEGACY_MODULES[shape] : undefined
  if (module) out.module = module

  const eyes = eyeShape ? LEGACY_EYES[eyeShape] : undefined
  if (eyes) {
    out.eyeFrame = eyes[0]
    out.eyeBall = eyes[1]
  }

  if (caption) out.frame = { ...DEFAULT_STYLE.frame, ...current.frame, caption }

  return out
}

/** A paint that a stored value may have written as a bare hex string. */
export function asPaint(value: Paint | string | null | undefined, fallback: Paint): Paint {
  if (!value) return fallback
  return typeof value === 'string' ? solid(value) : value
}
