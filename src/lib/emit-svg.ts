import { axis, isGradient, type Paint } from './paint'
import { clampRadii, type Prim } from './shapes'
import { CAPTION_FONT, type Drawing, type Layer } from './render'

/**
 * The drawing as SVG path data, shared by the file and the on-screen preview.
 *
 * Every renderer needs the same rounded rectangle with four independent radii, and this
 * is that shape in SVG's own syntax. Arcs rather than curves: `a` takes a radius directly,
 * so a corner is one command instead of four control points.
 */
export function primPath(prim: Prim): string {
  const [tl, tr, br, bl] = clampRadii(prim)
  const { x, y, w, h } = prim
  return [
    `M${n(x + tl)} ${n(y)}`,
    `H${n(x + w - tr)}`,
    tr ? `A${n(tr)} ${n(tr)} 0 0 1 ${n(x + w)} ${n(y + tr)}` : '',
    `V${n(y + h - br)}`,
    br ? `A${n(br)} ${n(br)} 0 0 1 ${n(x + w - br)} ${n(y + h)}` : '',
    `H${n(x + bl)}`,
    bl ? `A${n(bl)} ${n(bl)} 0 0 1 ${n(x)} ${n(y + h - bl)}` : '',
    `V${n(y + tl)}`,
    tl ? `A${n(tl)} ${n(tl)} 0 0 1 ${n(x + tl)} ${n(y)}` : '',
    'Z',
  ]
    .filter(Boolean)
    .join('')
}

export function layerPath(layer: Layer): string {
  return [...layer.prims, ...(layer.holes ?? [])].map(primPath).join('')
}

/** Three decimals is finer than a module ever gets drawn, and keeps the file small. */
function n(value: number): number {
  return Math.round(value * 1000) / 1000
}

/** XML, not HTML: five characters, and a caption is the only place text reaches it. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** A paint as something a `fill` attribute accepts, plus any `<defs>` it needs. */
export function paintRef(paint: Paint, id: string, size: number): { fill: string; def: string } {
  if (!isGradient(paint)) return { fill: paint.type === 'solid' ? paint.color : '#000000', def: '' }

  const stops = `<stop offset="0" stop-color="${'from' in paint ? paint.from : '#000'}"/><stop offset="1" stop-color="${'to' in paint ? paint.to : '#000'}"/>`

  if (paint.type === 'radial') {
    return {
      fill: `url(#${id})`,
      def: `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${n(size / 2)}" cy="${n(size / 2)}" r="${n(size * 0.72)}">${stops}</radialGradient>`,
    }
  }

  const line = axis(paint, size)
  return {
    fill: `url(#${id})`,
    def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n(line.x1)}" y1="${n(line.y1)}" x2="${n(line.x2)}" y2="${n(line.y2)}">${stops}</linearGradient>`,
  }
}

/**
 * Ids for the gradients a drawing needs, one per distinct paint.
 *
 * The corners follow the code's paint by default, so the same gradient turns up three
 * times in a drawing; declaring it once and pointing all three layers at it keeps the
 * file from carrying three copies of the same thing.
 */
export function paintRegistry(size: number) {
  const fills = new Map<string, string>()
  const defs: string[] = []

  return {
    defs,
    ref(paint: Paint): string {
      const key = JSON.stringify(paint)
      const known = fills.get(key)
      if (known) return known

      const { fill, def } = paintRef(paint, `g-${fills.size}`, size)
      fills.set(key, fill)
      if (def) defs.push(def)
      return fill
    },
  }
}

/**
 * The drawing as a standalone SVG document.
 *
 * Sizing is left to the caller's CSS when no pixel width is given, so the same emitter
 * serves a file and an inline preview.
 */
export function toSvg(drawing: Drawing, pixels?: number): string {
  const { width, height } = drawing
  const paints = paintRegistry(width)
  const defs: string[] = []
  const body: string[] = []

  if (drawing.background) {
    const fill = paints.ref(drawing.background.paint)
    const radius = n(drawing.background.round * width)
    body.push(
      `<rect width="${n(width)}" height="${n(height)}" rx="${radius}" ry="${radius}" fill="${fill}"/>`,
    )
  }

  for (const layer of drawing.layers) {
    const rule = layer.holes?.length ? ' fill-rule="evenodd"' : ''
    body.push(`<path fill="${paints.ref(layer.paint)}"${rule} d="${layerPath(layer)}"/>`)
  }

  if (drawing.logo) {
    const { src, x, y, size, round } = drawing.logo
    if (round) {
      defs.push(
        `<clipPath id="g-logo"><circle cx="${n(x + size / 2)}" cy="${n(y + size / 2)}" r="${n(size / 2)}"/></clipPath>`,
      )
    }
    body.push(
      `<image x="${n(x)}" y="${n(y)}" width="${n(size)}" height="${n(size)}" ` +
        `preserveAspectRatio="xMidYMid meet"${round ? ' clip-path="url(#g-logo)"' : ''} href="${src}"/>`,
    )
  }

  if (drawing.caption) {
    body.push(
      `<text x="${n(drawing.caption.x)}" y="${n(drawing.caption.y)}" fill="${paints.ref(drawing.caption.paint)}" ` +
        `font-family="${escapeXml(CAPTION_FONT)}" font-size="${drawing.caption.size}" ` +
        `font-weight="600" text-anchor="middle">${escapeXml(drawing.caption.text)}</text>`,
    )
  }

  const scale = pixels ? ` width="${pixels}" height="${n((pixels * height) / width)}"` : ''
  const declarations = [...paints.defs, ...defs]

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(width)} ${n(height)}"${scale}>`,
    declarations.length ? `<defs>${declarations.join('')}</defs>` : '',
    ...body,
    '</svg>',
  ].join('')
}
