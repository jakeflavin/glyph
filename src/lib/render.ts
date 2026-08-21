import { isDark, type Matrix } from './matrix'
import { flatten, solid, type Paint } from './paint'
import {
  box,
  eyeBall,
  eyeFrame,
  isRun,
  moduleAt,
  runAt,
  type EyeBallShape,
  type EyeFrameShape,
  type ModuleShape,
  type Prim,
} from './shapes'

export interface Logo {
  /** A data URL. The file never leaves the page, so there is nothing else it could be. */
  src: string
  /** Fraction of the symbol's width the image covers. Kept small; it destroys modules. */
  scale: number
  /** Extra clear modules around it, so the image is not crowded by the code. */
  margin: number
  /** Clear the modules behind it. Off means the image sits on top of them. */
  knockout: boolean
  /** Clip the image to a circle. */
  round: boolean
}

export type FrameStyle = 'none' | 'line' | 'bar' | 'card'

export interface Frame {
  style: FrameStyle
  /** The call to action. Empty draws no band at all. */
  caption: string
  position: 'below' | 'above'
}

export interface Style {
  module: ModuleShape
  eyeFrame: EyeFrameShape
  eyeBall: EyeBallShape
  /** Quiet zone in modules. The spec asks for 4; less is a gamble on the scanner. */
  margin: number
  /** The modules. */
  paint: Paint
  /** The ground behind them. */
  background: Paint
  /** No ground at all. PNG and SVG keep the transparency; JPEG and print cannot. */
  transparent: boolean
  /** Corner rounding on the ground, as a fraction of the whole width. */
  round: number
  /** The three corner patterns, or null to follow `paint`. */
  eyeFramePaint: Paint | null
  eyeBallPaint: Paint | null
  logo: Logo | null
  frame: Frame
}

/** A finder pattern is 7x7, and there is one in three of the four corners. */
const EYE = 7

/** Caption band, in module units: the type, plus air above and below it. */
const CAPTION_TYPE = 2.2
const CAPTION_BAND = 5

/** How far a frame stands off the quiet zone. */
const FRAME_PAD = 2

/** The stroke on a line frame. */
const FRAME_LINE = 0.4

export function eyeOrigins(matrix: Matrix): [number, number][] {
  const far = matrix.size - EYE
  return [
    [0, 0],
    [0, far],
    [far, 0],
  ]
}

function inEye(matrix: Matrix, row: number, col: number): boolean {
  return eyeOrigins(matrix).some(
    ([top, left]) => row >= top && row < top + EYE && col >= left && col < left + EYE,
  )
}

// ------------------------------------------------------------------ the drawing
//
// One description of the whole thing, in module units, that every renderer consumes: the
// preview, the SVG file, the raster formats, the PDF and the EPS. Emitting is per format;
// deciding what to draw happens once, here.

export interface Layer {
  prims: Prim[]
  /** Punched out of `prims` with an even-odd rule. Used by the finder rings. */
  holes?: Prim[]
  paint: Paint
}

export interface CaptionPlan {
  text: string
  /** The centre of the line, and its baseline. */
  x: number
  y: number
  size: number
  paint: Paint
}

export interface Drawing {
  width: number
  height: number
  /**
   * Whether to ask the renderer not to anti-alias.
   *
   * It lives on the drawing rather than being passed to each renderer, because the file
   * and the preview both have to make the same call — and when it was a prop on the
   * preview only, the downloaded SVG quietly lost it.
   */
  crisp: boolean
  background: { paint: Paint; round: number } | null
  layers: Layer[]
  logo: { src: string; x: number; y: number; size: number; round: boolean } | null
  caption: CaptionPlan | null
}

/** Modules across including the quiet zone. */
export function spanOf(matrix: Matrix, style: Style): number {
  return matrix.size + style.margin * 2
}

function captionHeight(style: Style): number {
  return style.frame.caption.trim() ? CAPTION_BAND : 0
}

function framePad(style: Style): number {
  return style.frame.style === 'none' ? 0 : FRAME_PAD
}

/** The whole drawing, which is square until a frame or a caption is added to it. */
export function viewBoxOf(matrix: Matrix, style: Style): { width: number; height: number } {
  const pad = framePad(style)
  const span = spanOf(matrix, style) + pad * 2
  return { width: span, height: span + captionHeight(style) }
}

/** Where the symbol's own top-left corner sits inside the drawing. */
function originOf(style: Style): { x: number; y: number } {
  const pad = framePad(style)
  const above = style.frame.caption.trim() && style.frame.position === 'above'
  return { x: pad + style.margin, y: pad + style.margin + (above ? captionHeight(style) : 0) }
}

/**
 * Every dark module except the three finder patterns.
 *
 * The bar shapes merge neighbours, so they walk runs rather than cells; everything else is
 * one primitive per module. Merging is the whole point of those two shapes — drawn one at
 * a time they are just rounded squares in a line, with a seam between each.
 */
function modulePrims(matrix: Matrix, style: Style): Prim[] {
  const { x: left, y: top } = originOf(style)
  const prims: Prim[] = []

  const paintable = (row: number, col: number) =>
    row >= 0 &&
    col >= 0 &&
    row < matrix.size &&
    col < matrix.size &&
    isDark(matrix, row, col) &&
    !inEye(matrix, row, col)

  if (!isRun(style.module)) {
    for (let row = 0; row < matrix.size; row += 1) {
      for (let col = 0; col < matrix.size; col += 1) {
        if (paintable(row, col)) prims.push(moduleAt(style.module, left + col, top + row))
      }
    }
    return prims
  }

  const horizontal = style.module === 'bars-h'
  for (let a = 0; a < matrix.size; a += 1) {
    let run = 0
    for (let b = 0; b <= matrix.size; b += 1) {
      const on = horizontal ? paintable(a, b) : paintable(b, a)
      if (on) {
        run += 1
        continue
      }
      if (run > 0) {
        const start = b - run
        prims.push(
          horizontal
            ? runAt(style.module, left + start, top + a, run)
            : runAt(style.module, left + a, top + start, run),
        )
        run = 0
      }
    }
  }
  return prims
}

/**
 * Where a logo sits, snapped to the module grid.
 *
 * Snapping matters: a knockout that ends half way through a module leaves a sliver of a
 * module behind, and a sliver reads as noise rather than as nothing.
 */
export function logoBox(
  matrix: Matrix,
  style: Style,
): { x: number; y: number; size: number } | null {
  if (!style.logo) return null
  const { x: left, y: top } = originOf(style)
  // Every QR symbol is an odd number of modules across, so an odd knockout is the only
  // one that centres exactly. An even one lands a module off and the code looks skewed.
  const wanted = Math.round(matrix.size * style.logo.scale)
  const modules = Math.max(3, wanted % 2 === 0 ? wanted + 1 : wanted)
  const offset = (matrix.size - modules) / 2
  return { x: left + offset, y: top + offset, size: modules }
}

/** The cleared square behind a logo, which is the logo's box plus its margin. */
function knockoutBox(matrix: Matrix, style: Style): Prim | null {
  const logo = logoBox(matrix, style)
  if (!logo || !style.logo?.knockout) return null
  const grow = Math.max(0, style.logo.margin)
  return box(logo.x - grow, logo.y - grow, logo.size + grow * 2, logo.size + grow * 2, 0.4)
}

function captionPlan(matrix: Matrix, style: Style): CaptionPlan | null {
  const text = style.frame.caption.trim()
  if (!text) return null

  const { width, height } = viewBoxOf(matrix, style)
  const band = style.frame.position === 'above' ? 0 : height - CAPTION_BAND
  const onBar = style.frame.style === 'bar' || style.frame.style === 'card'

  return {
    text,
    x: width / 2,
    // The type sits on its baseline, a little below the middle of its band.
    y: band + CAPTION_BAND / 2 + CAPTION_TYPE * 0.36,
    size: CAPTION_TYPE,
    paint: onBar ? style.background : style.paint,
  }
}

/** The bands and rules a frame adds around the code. */
function framePrims(matrix: Matrix, style: Style): Layer[] {
  const { width, height } = viewBoxOf(matrix, style)
  const hasCaption = Boolean(style.frame.caption.trim())
  const above = style.frame.position === 'above'
  const bandY = above ? 0 : height - CAPTION_BAND

  switch (style.frame.style) {
    case 'none':
      return []

    case 'line': {
      const inset = FRAME_LINE / 2
      return [
        {
          paint: style.paint,
          prims: [box(inset, inset, width - FRAME_LINE, height - FRAME_LINE, 1.4)],
          holes: [
            box(
              FRAME_LINE + inset,
              FRAME_LINE + inset,
              width - FRAME_LINE * 3,
              height - FRAME_LINE * 3,
              1.1,
            ),
          ],
        },
      ]
    }

    case 'bar':
      return hasCaption ? [{ paint: style.paint, prims: [box(0, bandY, width, CAPTION_BAND)] }] : []

    case 'card': {
      // The band's outer corners follow the card's; the inner two stay square so the band
      // meets the code with a straight edge rather than a pinch.
      const radius = 1.6
      const corners: [number, number, number, number] = above
        ? [radius, radius, 0, 0]
        : [0, 0, radius, radius]
      return hasCaption
        ? [{ paint: style.paint, prims: [box(0, bandY, width, CAPTION_BAND, corners)] }]
        : []
    }
  }
}

/** Everything to draw, in module units. Every renderer starts here. */
export function planDrawing(matrix: Matrix, style: Style): Drawing {
  const { width, height } = viewBoxOf(matrix, style)
  const { x: left, y: top } = originOf(style)
  const knockout = knockoutBox(matrix, style)

  const frames: Prim[] = []
  const frameHoles: Prim[] = []
  const balls: Prim[] = []
  for (const [row, col] of eyeOrigins(matrix)) {
    const [outer, hole] = eyeFrame(style.eyeFrame, left + col, top + row)
    frames.push(outer)
    frameHoles.push(hole)
    balls.push(eyeBall(style.eyeBall, left + col, top + row))
  }

  const cardRound = style.frame.style === 'card' ? 1.6 / width : style.round

  return {
    width,
    height,
    crisp: style.module === 'square',
    background: style.transparent
      ? null
      : { paint: style.background, round: Math.max(0, Math.min(0.5, cardRound)) },
    layers: [
      ...framePrims(matrix, style),
      {
        paint: style.paint,
        prims: modulePrims(matrix, style),
        holes: knockout ? [knockout] : undefined,
      },
      { paint: style.eyeFramePaint ?? style.paint, prims: frames, holes: frameHoles },
      { paint: style.eyeBallPaint ?? style.eyeFramePaint ?? style.paint, prims: balls },
    ].filter((layer) => layer.prims.length > 0),
    logo: style.logo
      ? (() => {
          const spot = logoBox(matrix, style)
          return spot ? { src: style.logo.src, ...spot, round: style.logo.round } : null
        })()
      : null,
    caption: captionPlan(matrix, style),
  }
}

/** The colours a contrast check has to consider: both ends of both paints. */
export function paintsOf(style: Style): { code: Paint; ground: Paint } {
  return { code: style.paint, ground: style.transparent ? solid('#ffffff') : style.background }
}

/**
 * The caption is drawn in whatever sans-serif the reader has, and so is anyone else who
 * opens the SVG. Naming a font that has to be installed would look right here and wrong
 * everywhere else, so the file asks for the generic and gets a real answer everywhere.
 */
export const CAPTION_FONT = "ui-sans-serif, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

/** A flat colour for the formats that cannot hold a gradient. */
export function flatPaint(paint: Paint): string {
  return flatten(paint)
}
