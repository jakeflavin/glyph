import { normalizeHex } from './colors'

/**
 * A fill: one colour, or two with a direction.
 *
 * Kept as data rather than as a CSS string because four renderers need it in four
 * different forms — an SVG `<defs>` entry, a canvas gradient object, a PDF shading
 * dictionary, and a flat colour where the format cannot do better than that.
 */
export type Paint =
  | { type: 'solid'; color: string }
  | { type: 'linear'; from: string; to: string; angle: number }
  | { type: 'radial'; from: string; to: string }

export function solid(color: string): Paint {
  return { type: 'solid', color }
}

/** What a format that cannot draw a gradient should use instead. */
export function flatten(paint: Paint): string {
  return normalizeHex(paint.type === 'solid' ? paint.color : paint.from)
}

/** The two ends of a paint, for a contrast check that has to consider both. */
export function stops(paint: Paint): [string, string] {
  return paint.type === 'solid'
    ? [normalizeHex(paint.color), normalizeHex(paint.color)]
    : [normalizeHex(paint.from), normalizeHex(paint.to)]
}

export function isGradient(paint: Paint): boolean {
  return paint.type !== 'solid'
}

/**
 * A gradient's two ends in the drawing's own units, given the box it covers.
 *
 * The angle is degrees clockwise from "left to right", which is how it reads in the UI.
 * A radial gradient has no angle; it runs from the middle outwards.
 */
export function axis(
  paint: Paint,
  size: number,
): { x1: number; y1: number; x2: number; y2: number } {
  if (paint.type !== 'linear') return { x1: 0, y1: 0, x2: size, y2: 0 }
  const radians = (paint.angle * Math.PI) / 180
  const half = size / 2
  // The axis is a diameter of the box's bounding circle, so the ends always sit outside
  // the corners and the full colour range lands inside the drawing at every angle.
  const reach = (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians))) * half
  return {
    x1: half - Math.cos(radians) * reach,
    y1: half - Math.sin(radians) * reach,
    x2: half + Math.cos(radians) * reach,
    y2: half + Math.sin(radians) * reach,
  }
}

/** A CSS value, for the swatch that previews a paint in the controls. */
export function toCss(paint: Paint): string {
  switch (paint.type) {
    case 'solid':
      return paint.color
    case 'linear':
      return `linear-gradient(${paint.angle + 90}deg, ${paint.from}, ${paint.to})`
    case 'radial':
      return `radial-gradient(circle, ${paint.from}, ${paint.to})`
  }
}
