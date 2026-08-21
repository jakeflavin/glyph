import { isDark, type Matrix } from './matrix'

export type Shape = 'square' | 'rounded' | 'dot'

export interface Style {
  shape: Shape
  /** Quiet zone in modules. The spec asks for 4; less is a gamble on the scanner. */
  margin: number
  /** Light modules on a dark ground. Scanners handle it, but not all of them. */
  invert: boolean
}

const DARK = '#000000'
const LIGHT = '#ffffff'

/**
 * One module as SVG path data, in module units.
 *
 * The whole symbol is a single `<path>` rather than a rect per module: a version 40 code
 * is 31k modules, and 31k elements is enough to make the preview stutter while typing.
 */
function modulePath(shape: Shape, x: number, y: number): string {
  switch (shape) {
    case 'square':
      return `M${x} ${y}h1v1h-1z`
    case 'rounded':
      // A 0.25 radius rounds the corner without narrowing the run where modules touch.
      return `M${x + 0.25} ${y}h0.5a0.25 0.25 0 0 1 0.25 0.25v0.5a0.25 0.25 0 0 1 -0.25 0.25h-0.5a0.25 0.25 0 0 1 -0.25 -0.25v-0.5a0.25 0.25 0 0 1 0.25 -0.25z`
    case 'dot':
      return `M${x + 0.5} ${y + 0.05}a0.45 0.45 0 1 1 0 0.9a0.45 0.45 0 1 1 0 -0.9z`
  }
}

/** Modules across including the quiet zone, which is the SVG's viewBox span. */
export function spanOf(matrix: Matrix, style: Style): number {
  return matrix.size + style.margin * 2
}

/** The whole symbol as one path, in module units. Shared by the preview and the file. */
export function modulesPath(matrix: Matrix, style: Style): string {
  return pathData(matrix, style.shape, style.margin)
}

export const COLOURS = { dark: DARK, light: LIGHT }

function pathData(matrix: Matrix, shape: Shape, margin: number): string {
  const parts: string[] = []
  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (isDark(matrix, row, col)) parts.push(modulePath(shape, col + margin, row + margin))
    }
  }
  return parts.join('')
}

/**
 * The symbol as an SVG document.
 *
 * The viewBox is in module units and the sizing is left to the caller's CSS, so the same
 * string serves the on-screen preview and the downloaded file. `shape-rendering` is what
 * keeps square modules from being anti-aliased into grey seams at small sizes.
 */
export function toSvg(matrix: Matrix, style: Style, pixels?: number): string {
  const span = spanOf(matrix, style)
  const fg = style.invert ? LIGHT : DARK
  const bg = style.invert ? DARK : LIGHT
  const size = pixels ? ` width="${pixels}" height="${pixels}"` : ''
  const rendering = style.shape === 'square' ? ' shape-rendering="crispEdges"' : ''

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${span} ${span}"${size}${rendering}>`,
    `<rect width="${span}" height="${span}" fill="${bg}"/>`,
    `<path fill="${fg}" d="${modulesPath(matrix, style)}"/>`,
    '</svg>',
  ].join('')
}

/**
 * The symbol as a PNG, drawn module by module rather than by rasterising the SVG.
 *
 * Going through an `<img>` would mean an async decode and a tainted-canvas risk for no
 * gain: a QR code is squares on a grid, and drawing them directly lands every edge on a
 * whole pixel when the requested size is a multiple of the span.
 */
export function toPngBlob(matrix: Matrix, style: Style, pixels: number): Promise<Blob> {
  const span = spanOf(matrix, style)
  const scale = pixels / span
  const canvas = document.createElement('canvas')
  canvas.width = pixels
  canvas.height = pixels

  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('This browser would not give us a canvas.'))

  ctx.fillStyle = style.invert ? DARK : LIGHT
  ctx.fillRect(0, 0, pixels, pixels)
  ctx.fillStyle = style.invert ? LIGHT : DARK

  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (!isDark(matrix, row, col)) continue
      const x = (col + style.margin) * scale
      const y = (row + style.margin) * scale
      if (style.shape === 'dot') {
        ctx.beginPath()
        ctx.arc(x + scale / 2, y + scale / 2, scale * 0.45, 0, Math.PI * 2)
        ctx.fill()
      } else if (style.shape === 'rounded') {
        ctx.beginPath()
        ctx.roundRect(x, y, scale, scale, scale * 0.25)
        ctx.fill()
      } else {
        // Squares are rounded outward so neighbours meet with no hairline between them.
        const right = Math.round(x + scale)
        const bottom = Math.round(y + scale)
        const left = Math.round(x)
        const top = Math.round(y)
        ctx.fillRect(left, top, right - left, bottom - top)
      }
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be made.'))),
      'image/png',
    )
  })
}
