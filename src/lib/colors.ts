/**
 * Colour, for the code rather than for the app.
 *
 * A scanner does not read hue, it reads contrast: it thresholds the image into light and
 * dark, and a pretty pair that lands close together on that axis produces a code nothing
 * can read. So every colour here is checked before it is offered, and the check is the
 * same WCAG relative-luminance ratio used for text — not because a QR code is text, but
 * because it is the one contrast measure that already agrees with what cameras do.
 */

export interface Palette {
  id: string
  label: string
  dark: string
  light: string
}

/**
 * The presets. Every pair clears 7:1 against its ground, which leaves room for a phone
 * camera, a cheap printer and a shop window between them.
 *
 * A gradient is two colours and either end can be the one that fails, so the two-colour
 * presets below are held to the same bar at *both* ends. The app's own check caught the
 * first attempt at Pine, whose light end sat at 6.3 on white.
 */
export const PALETTES: [Palette, ...Palette[]] = [
  { id: 'mono', label: 'Black', dark: '#000000', light: '#ffffff' },
  { id: 'ink', label: 'Ink', dark: '#111a3d', light: '#ffffff' },
  { id: 'forest', label: 'Forest', dark: '#0f3b28', light: '#ffffff' },
  { id: 'wine', label: 'Wine', dark: '#5c1024', light: '#ffffff' },
  { id: 'cream', label: 'Cream', dark: '#1c1a17', light: '#f6efe2' },
  { id: 'night', label: 'Night', dark: '#f2f2f2', light: '#101010' },
]

/** Pairs that only make sense as a gradient, so the presets can offer one at all. */
export interface GradientPalette {
  id: string
  label: string
  from: string
  to: string
  /** Radial has no angle; a linear one is degrees clockwise from left to right. */
  angle: number | null
}

export const GRADIENT_PALETTES: [GradientPalette, ...GradientPalette[]] = [
  { id: 'dusk', label: 'Dusk', from: '#2b1b6b', to: '#8a1c4f', angle: 45 },
  { id: 'pine', label: 'Pine', from: '#0b3d2e', to: '#14523a', angle: 90 },
  { id: 'ember', label: 'Ember', from: '#7a1f12', to: '#2b0d08', angle: null },
]

/** `#rgb` and `#rrggbb`, upper or lower case, to three 0-255 channels. */
export function parseHex(value: string): [number, number, number] | null {
  const hex = value.trim().replace(/^#/, '')
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ]
}

/** A colour the renderers can put in a file, or black if it was never a colour. */
export function normalizeHex(value: string, fallback = '#000000'): string {
  const rgb = parseHex(value)
  if (!rgb) return fallback
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (raw: number) => {
    const value = raw / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** 1 for two identical colours, 21 for black on white. */
export function contrastRatio(a: string, b: string): number {
  const first = parseHex(a)
  const second = parseHex(b)
  if (!first || !second) return 1
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second))
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second))
  return (lighter + 0.05) / (darker + 0.05)
}

export type ContrastVerdict = 'good' | 'tight' | 'bad'

/**
 * What to tell someone about a pair.
 *
 * The thresholds are deliberately conservative. A phone in good light reads far less than
 * 7:1, and a code photographed off a screen reads less again — but the failures are all at
 * the far end, on a printed sticker in bad light, where nobody is around to try twice.
 */
export function verdictFor(dark: string, light: string): ContrastVerdict {
  const ratio = contrastRatio(dark, light)
  if (ratio >= 7) return 'good'
  if (ratio >= 4) return 'tight'
  return 'bad'
}

/**
 * Which of the pair a scanner will take as the dark side.
 *
 * Most scanners handle a light-on-dark code and some older ones do not, so the app says
 * which way round it is rather than silently swapping it.
 */
export function isLightOnDark(dark: string, light: string): boolean {
  const foreground = parseHex(dark)
  const background = parseHex(light)
  if (!foreground || !background) return false
  return relativeLuminance(foreground) > relativeLuminance(background)
}
