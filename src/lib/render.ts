import { isDark, type Matrix } from './matrix'
import { normalizeHex } from './colors'

export type Shape = 'square' | 'rounded' | 'dot'
export type EyeShape = 'square' | 'rounded' | 'circle'

export interface Logo {
  /** A data URL. The file never leaves the page, so there is nothing else it could be. */
  src: string
  /** Fraction of the symbol's width the image covers. Kept small; it destroys modules. */
  scale: number
}

export interface Style {
  shape: Shape
  eyeShape: EyeShape
  /** Quiet zone in modules. The spec asks for 4; less is a gamble on the scanner. */
  margin: number
  /** The modules. */
  dark: string
  /** The ground behind them. */
  light: string
  /** The three corner patterns, or null to follow `dark`. */
  eye: string | null
  logo: Logo | null
  /** Printed under the code, in the file as well as in the preview. */
  caption: string
}

/** A finder pattern is 7x7, and there is one in three of the four corners. */
const EYE = 7

/** Caption band, in module units: the type, plus air above and below it. */
const CAPTION_TYPE = 2.2
const CAPTION_BAND = 4.4

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

// ------------------------------------------------------------------ geometry
//
// Everything below is in module units, and is shared by the on-screen preview and the
// downloaded file. The preview renders it as JSX so React escapes the caption; the file
// renders it as a string. Neither owns the shapes, so the two cannot drift.

export interface Box {
  x: number
  y: number
  size: number
}

/** Modules across including the quiet zone. */
export function spanOf(matrix: Matrix, style: Style): number {
  return matrix.size + style.margin * 2
}

/** The whole drawing, which is square until a caption is added under it. */
export function viewBoxOf(matrix: Matrix, style: Style): { width: number; height: number } {
  const span = spanOf(matrix, style)
  return { width: span, height: span + (style.caption.trim() ? CAPTION_BAND : 0) }
}

function rect(x: number, y: number, size: number): string {
  return `M${round(x)} ${round(y)}h${round(size)}v${round(size)}h${round(-size)}z`
}

function roundedRect(x: number, y: number, size: number, radius: number): string {
  const r = Math.min(radius, size / 2)
  const inner = size - r * 2
  return [
    `M${round(x + r)} ${round(y)}`,
    `h${round(inner)}`,
    `a${round(r)} ${round(r)} 0 0 1 ${round(r)} ${round(r)}`,
    `v${round(inner)}`,
    `a${round(r)} ${round(r)} 0 0 1 ${round(-r)} ${round(r)}`,
    `h${round(-inner)}`,
    `a${round(r)} ${round(r)} 0 0 1 ${round(-r)} ${round(-r)}`,
    `v${round(-inner)}`,
    `a${round(r)} ${round(r)} 0 0 1 ${round(r)} ${round(-r)}`,
    'z',
  ].join('')
}

function circle(cx: number, cy: number, radius: number): string {
  const r = round(radius)
  return `M${round(cx - radius)} ${round(cy)}a${r} ${r} 0 1 0 ${round(radius * 2)} 0a${r} ${r} 0 1 0 ${round(-radius * 2)} 0z`
}

/** Three decimals is finer than a module ever gets drawn, and keeps the file small. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

function modulePath(shape: Shape, x: number, y: number): string {
  switch (shape) {
    case 'square':
      return rect(x, y, 1)
    case 'rounded':
      // A 0.25 radius softens the corner without narrowing the run where modules touch.
      return roundedRect(x, y, 1, 0.25)
    case 'dot':
      return circle(x + 0.5, y + 0.5, 0.45)
  }
}

/**
 * Every dark module except the three finder patterns, as one path.
 *
 * One path rather than an element per module: a version 40 code is 31k modules, and 31k
 * elements is enough to make the preview stutter while typing.
 */
export function dataPath(matrix: Matrix, style: Style): string {
  const parts: string[] = []
  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (!isDark(matrix, row, col) || inEye(matrix, row, col)) continue
      parts.push(modulePath(style.shape, col + style.margin, row + style.margin))
    }
  }
  return parts.join('')
}

/**
 * The three finder patterns, as one even-odd path: outer ring, hole, centre.
 *
 * They are drawn apart from the data because they are the part a scanner looks for first,
 * and because they are the part worth colouring on their own. Their proportions are fixed
 * by the spec — 7 modules, a 5-module hole, a 3-module centre — so only the corner radius
 * changes between the shapes.
 */
export function eyePath(matrix: Matrix, style: Style): string {
  const parts: string[] = []

  for (const [top, left] of eyeOrigins(matrix)) {
    const x = left + style.margin
    const y = top + style.margin

    if (style.eyeShape === 'circle') {
      parts.push(
        circle(x + 3.5, y + 3.5, 3.5),
        circle(x + 3.5, y + 3.5, 2.5),
        circle(x + 3.5, y + 3.5, 1.5),
      )
      continue
    }

    const radius = style.eyeShape === 'rounded' ? 2 : 0
    parts.push(
      radius ? roundedRect(x, y, 7, radius) : rect(x, y, 7),
      radius ? roundedRect(x + 1, y + 1, 5, radius - 0.6) : rect(x + 1, y + 1, 5),
      radius ? roundedRect(x + 2, y + 2, 3, radius - 1.2) : rect(x + 2, y + 2, 3),
    )
  }

  return parts.join('')
}

/**
 * Where a logo sits, snapped to the module grid.
 *
 * Snapping matters: a knockout that ends half way through a module leaves a sliver of a
 * module behind, and a sliver reads as noise rather than as nothing.
 */
export function logoBox(matrix: Matrix, style: Style): Box | null {
  if (!style.logo) return null
  // Every QR symbol is an odd number of modules across, so an odd knockout is the only
  // one that centres exactly. An even one lands a module off and the code looks skewed.
  const wanted = Math.round(matrix.size * style.logo.scale)
  const modules = Math.max(3, wanted % 2 === 0 ? wanted + 1 : wanted)
  const offset = (matrix.size - modules) / 2 + style.margin
  return { x: offset, y: offset, size: modules }
}

export interface CaptionLayout {
  text: string
  x: number
  y: number
  fontSize: number
}

export function captionLayout(matrix: Matrix, style: Style): CaptionLayout | null {
  const text = style.caption.trim()
  if (!text) return null
  const span = spanOf(matrix, style)
  return {
    text,
    x: span / 2,
    // The band is measured from the symbol's edge, and the type sits on its baseline.
    y: span + CAPTION_BAND / 2 + CAPTION_TYPE * 0.36,
    fontSize: CAPTION_TYPE,
  }
}

/** The colours a renderer actually paints with, with `eye` resolved and hexes checked. */
export function coloursOf(style: Style): { dark: string; light: string; eye: string } {
  const dark = normalizeHex(style.dark, '#000000')
  return {
    dark,
    light: normalizeHex(style.light, '#ffffff'),
    eye: style.eye ? normalizeHex(style.eye, dark) : dark,
  }
}

/**
 * The caption is drawn in whatever sans-serif the reader has, and so is anyone else who
 * opens the SVG. Naming a font that has to be installed would look right here and wrong
 * everywhere else, so the file asks for the generic and gets a real answer everywhere.
 */
export const CAPTION_FONT = "ui-sans-serif, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

// -------------------------------------------------------------------- the file

/** XML, not HTML: five characters, and a caption is the only place text reaches it. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * The symbol as an SVG document.
 *
 * Sizing is left to the caller's CSS when no pixel width is given, so the same geometry
 * serves the preview and the file.
 */
export function toSvg(matrix: Matrix, style: Style, pixels?: number): string {
  const { width, height } = viewBoxOf(matrix, style)
  const { dark, light, eye } = coloursOf(style)
  const logo = logoBox(matrix, style)
  const caption = captionLayout(matrix, style)
  const scale = pixels ? ` width="${pixels}" height="${round((pixels * height) / width)}"` : ''
  const rendering = style.shape === 'square' ? ' shape-rendering="crispEdges"' : ''

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"${scale}${rendering}>`,
    `<rect width="${width}" height="${height}" fill="${light}"/>`,
    `<path fill="${dark}" d="${dataPath(matrix, style)}"/>`,
    `<path fill="${eye}" fill-rule="evenodd" d="${eyePath(matrix, style)}"/>`,
  ]

  if (logo && style.logo) {
    parts.push(
      `<rect x="${logo.x}" y="${logo.y}" width="${logo.size}" height="${logo.size}" fill="${light}"/>`,
      `<image x="${round(logo.x + logo.size * 0.08)}" y="${round(logo.y + logo.size * 0.08)}" ` +
        `width="${round(logo.size * 0.84)}" height="${round(logo.size * 0.84)}" ` +
        `preserveAspectRatio="xMidYMid meet" href="${style.logo.src}"/>`,
    )
  }

  if (caption) {
    parts.push(
      `<text x="${round(caption.x)}" y="${round(caption.y)}" fill="${dark}" ` +
        `font-family="${escapeXml(CAPTION_FONT)}" font-size="${caption.fontSize}" ` +
        `font-weight="600" text-anchor="middle">${escapeXml(caption.text)}</text>`,
    )
  }

  parts.push('</svg>')
  return parts.join('')
}

/**
 * The symbol as a PNG.
 *
 * Drawn from the same geometry rather than by rasterising the SVG string: an `<img>` of an
 * SVG that itself embeds an image decodes inconsistently across browsers, and Safari has
 * refused it outright. `pixels` is the width; a caption makes the file taller than it is
 * wide.
 */
export async function toPngBlob(matrix: Matrix, style: Style, pixels: number): Promise<Blob> {
  const { width, height } = viewBoxOf(matrix, style)
  const unit = pixels / width
  const canvas = document.createElement('canvas')
  canvas.width = pixels
  canvas.height = Math.round(height * unit)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser would not give us a canvas.')

  const { dark, light, eye } = coloursOf(style)
  ctx.fillStyle = light
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The paths are in module units, so the whole drawing scales in one step.
  ctx.save()
  ctx.scale(unit, unit)
  ctx.fillStyle = dark
  ctx.fill(new Path2D(dataPath(matrix, style)))
  ctx.fillStyle = eye
  ctx.fill(new Path2D(eyePath(matrix, style)), 'evenodd')

  const logo = logoBox(matrix, style)
  if (logo && style.logo) {
    ctx.fillStyle = light
    ctx.fillRect(logo.x, logo.y, logo.size, logo.size)
    const image = await loadImage(style.logo.src)
    const fit = contain(image.width, image.height, logo.size * 0.84)
    ctx.drawImage(
      image,
      logo.x + (logo.size - fit.width) / 2,
      logo.y + (logo.size - fit.height) / 2,
      fit.width,
      fit.height,
    )
  }

  const caption = captionLayout(matrix, style)
  if (caption) {
    ctx.fillStyle = dark
    ctx.font = `600 ${caption.fontSize}px ${CAPTION_FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(caption.text, caption.x, caption.y)
  }
  ctx.restore()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be made.'))),
      'image/png',
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('That image could not be read.'))
    image.src = src
  })
}

/** The image's own aspect ratio, inside a square box. */
function contain(width: number, height: number, box: number): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: box, height: box }
  const ratio = width / height
  return ratio >= 1 ? { width: box, height: box / ratio } : { width: box * ratio, height: box }
}
