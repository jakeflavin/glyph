import { axis, isGradient, type Paint } from './paint'
import { clampRadii, type Prim } from './shapes'
import { CAPTION_FONT, type Drawing } from './render'

export type RasterFormat = 'image/png' | 'image/jpeg' | 'image/webp'

/**
 * The drawing on a canvas.
 *
 * Drawn from the same plan as the SVG rather than by rasterising it: an `<img>` of an SVG
 * that itself embeds an image decodes inconsistently across browsers, and Safari has
 * refused it outright. `pixels` is the width; a caption makes the result taller than wide.
 */
export async function toCanvas(drawing: Drawing, pixels: number): Promise<HTMLCanvasElement> {
  const unit = pixels / drawing.width
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(pixels)
  canvas.height = Math.round(drawing.height * unit)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser would not give us a canvas.')

  ctx.scale(unit, unit)

  if (drawing.background) {
    ctx.fillStyle = fillFor(ctx, drawing.background.paint, drawing.width)
    trace(ctx, [
      {
        x: 0,
        y: 0,
        w: drawing.width,
        h: drawing.height,
        r: radiiOf(drawing.background.round * drawing.width),
      },
    ])
    ctx.fill()
  }

  for (const layer of drawing.layers) {
    ctx.fillStyle = fillFor(ctx, layer.paint, drawing.width)
    trace(ctx, [...layer.prims, ...(layer.holes ?? [])])
    ctx.fill(layer.holes?.length ? 'evenodd' : 'nonzero')
  }

  if (drawing.logo) {
    const image = await loadImage(drawing.logo.src)
    const { x, y, size, round } = drawing.logo
    ctx.save()
    if (round) {
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()
    }
    const fit = contain(image.width, image.height, size)
    ctx.drawImage(
      image,
      x + (size - fit.width) / 2,
      y + (size - fit.height) / 2,
      fit.width,
      fit.height,
    )
    ctx.restore()
  }

  if (drawing.caption) {
    ctx.fillStyle = fillFor(ctx, drawing.caption.paint, drawing.width)
    ctx.font = `600 ${drawing.caption.size}px ${CAPTION_FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(drawing.caption.text, drawing.caption.x, drawing.caption.y)
  }

  return canvas
}

export async function toRasterBlob(
  drawing: Drawing,
  pixels: number,
  format: RasterFormat,
): Promise<Blob> {
  const canvas = await toCanvas(drawing, pixels)

  // JPEG has no alpha, so a transparent drawing would come out black. White is the ground
  // every scanner expects, and the format cannot hold the intent either way.
  const flat = format === 'image/jpeg' && !drawing.background ? onWhite(canvas) : canvas

  return new Promise((resolve, reject) => {
    flat.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be made.'))),
      format,
      format === 'image/png' ? undefined : 0.92,
    )
  })
}

function onWhite(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const flat = document.createElement('canvas')
  flat.width = canvas.width
  flat.height = canvas.height
  const ctx = flat.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, flat.width, flat.height)
  ctx.drawImage(canvas, 0, 0)
  return flat
}

function radiiOf(radius: number): [number, number, number, number] {
  return [radius, radius, radius, radius]
}

function trace(ctx: CanvasRenderingContext2D, prims: Prim[]): void {
  ctx.beginPath()
  for (const prim of prims) ctx.roundRect(prim.x, prim.y, prim.w, prim.h, clampRadii(prim))
}

function fillFor(
  ctx: CanvasRenderingContext2D,
  paint: Paint,
  size: number,
): string | CanvasGradient {
  if (!isGradient(paint)) return paint.type === 'solid' ? paint.color : '#000000'
  if (paint.type === 'solid') return paint.color

  const gradient =
    paint.type === 'radial'
      ? ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.72)
      : (() => {
          const line = axis(paint, size)
          return ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2)
        })()

  gradient.addColorStop(0, paint.from)
  gradient.addColorStop(1, paint.to)
  return gradient
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
function contain(
  width: number,
  height: number,
  boxSize: number,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: boxSize, height: boxSize }
  const ratio = width / height
  return ratio >= 1
    ? { width: boxSize, height: boxSize / ratio }
    : { width: boxSize * ratio, height: boxSize }
}
