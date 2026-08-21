/**
 * Every shape this app draws, as one primitive.
 *
 * A rounded rectangle with four independent corner radii covers all of it: a square
 * module is one with no radii, a dot is one whose radii are half its width, a "classy"
 * module rounds two opposite corners, a bar is a run of modules merged into one, and a
 * finder pattern is a pair of them with the inner one punched out.
 *
 * One primitive is what makes four output formats affordable. SVG, canvas, PDF and EPS
 * each need their own syntax for a curve, and writing that once per format is a page of
 * code; writing it once per format *per shape* is not.
 */

/** Corner radii, clockwise from the top left. In module units, like everything here. */
export type Radii = [number, number, number, number]

export interface Prim {
  x: number
  y: number
  w: number
  h: number
  r: Radii
}

export function box(x: number, y: number, w: number, h: number, r: number | Radii = 0): Prim {
  return { x, y, w, h, r: typeof r === 'number' ? [r, r, r, r] : r }
}

/** A circle is the rounded rectangle whose radii are half its side. */
export function disc(cx: number, cy: number, radius: number): Prim {
  return box(cx - radius, cy - radius, radius * 2, radius * 2, radius)
}

/** No radius may exceed half the side it sits on, or the corners cross over each other. */
export function clampRadii(prim: Prim): Radii {
  const limit = Math.min(prim.w, prim.h) / 2
  return prim.r.map((radius) => Math.max(0, Math.min(radius, limit))) as Radii
}

// ------------------------------------------------------------------ catalogues

export type ModuleShape =
  'square' | 'rounded' | 'smooth' | 'classy' | 'dot' | 'diamond' | 'bars-h' | 'bars-v'

export type EyeFrameShape = 'square' | 'rounded' | 'circle' | 'leaf' | 'cushion'
export type EyeBallShape = 'square' | 'rounded' | 'circle' | 'leaf' | 'diamond'

export const MODULE_SHAPES: [
  { id: ModuleShape; label: string },
  ...{ id: ModuleShape; label: string }[],
] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'smooth', label: 'Smooth' },
  { id: 'classy', label: 'Classy' },
  { id: 'dot', label: 'Dots' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'bars-v', label: 'Columns' },
  { id: 'bars-h', label: 'Rows' },
]

export const EYE_FRAME_SHAPES: [
  { id: EyeFrameShape; label: string },
  ...{ id: EyeFrameShape; label: string }[],
] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'circle', label: 'Circle' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'cushion', label: 'Cushion' },
]

export const EYE_BALL_SHAPES: [
  { id: EyeBallShape; label: string },
  ...{ id: EyeBallShape; label: string }[],
] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'circle', label: 'Circle' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'diamond', label: 'Diamond' },
]

/** The shapes that merge neighbouring modules, and so cannot be drawn one at a time. */
export function isRun(shape: ModuleShape): boolean {
  return shape === 'bars-h' || shape === 'bars-v'
}

/**
 * One module.
 *
 * `diamond` is the one shape that is not a rounded rectangle of its own: it is a square
 * turned 45 degrees, which the primitive cannot express, so it is approximated as a
 * heavily rounded square inset a little. The difference at print size is a hair, and it
 * keeps every renderer to one code path.
 */
export function moduleAt(shape: ModuleShape, x: number, y: number): Prim {
  switch (shape) {
    case 'square':
      return box(x, y, 1, 1)
    case 'rounded':
      return box(x, y, 1, 1, 0.25)
    case 'smooth':
      return box(x, y, 1, 1, 0.45)
    case 'classy':
      return box(x, y, 1, 1, [0.5, 0, 0.5, 0])
    case 'dot':
      return disc(x + 0.5, y + 0.5, 0.45)
    case 'diamond':
      return box(x + 0.08, y + 0.08, 0.84, 0.84, 0.36)
    case 'bars-h':
    case 'bars-v':
      // Only reached for a run of one, which is a lone module with round ends.
      return box(x, y, 1, 1, 0.5)
  }
}

/** A run of `length` modules, merged, with the ends rounded and the middle straight. */
export function runAt(shape: ModuleShape, x: number, y: number, length: number): Prim {
  return shape === 'bars-h'
    ? box(x, y + 0.05, length, 0.9, 0.45)
    : box(x + 0.05, y, 0.9, length, 0.45)
}

/**
 * A finder pattern's outer ring, as the outer shape and the hole to punch out of it.
 *
 * The spec fixes the proportions — 7 modules, a 5-module hole, a 3-module centre — so a
 * shape only chooses the corners. Anything that moved those numbers would stop being a
 * finder pattern, which is the one part of a code a scanner looks for by shape.
 */
export function eyeFrame(shape: EyeFrameShape, x: number, y: number): [Prim, Prim] {
  switch (shape) {
    case 'square':
      return [box(x, y, 7, 7), box(x + 1, y + 1, 5, 5)]
    case 'rounded':
      return [box(x, y, 7, 7, 2), box(x + 1, y + 1, 5, 5, 1.4)]
    case 'circle':
      return [disc(x + 3.5, y + 3.5, 3.5), disc(x + 3.5, y + 3.5, 2.5)]
    case 'leaf':
      return [box(x, y, 7, 7, [3.5, 0, 3.5, 0]), box(x + 1, y + 1, 5, 5, [2.5, 0, 2.5, 0])]
    case 'cushion':
      return [box(x, y, 7, 7, [3.5, 0.8, 3.5, 0.8]), box(x + 1, y + 1, 5, 5, [2.5, 0.6, 2.5, 0.6])]
  }
}

/** A finder pattern's centre. */
export function eyeBall(shape: EyeBallShape, x: number, y: number): Prim {
  switch (shape) {
    case 'square':
      return box(x + 2, y + 2, 3, 3)
    case 'rounded':
      return box(x + 2, y + 2, 3, 3, 1)
    case 'circle':
      return disc(x + 3.5, y + 3.5, 1.5)
    case 'leaf':
      return box(x + 2, y + 2, 3, 3, [1.5, 0, 1.5, 0])
    case 'diamond':
      return box(x + 2.15, y + 2.15, 2.7, 2.7, 1.15)
  }
}
