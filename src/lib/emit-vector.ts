import { axis, isGradient, type Paint } from './paint'
import { clampRadii, type Prim } from './shapes'
import { flatPaint, type Drawing } from './render'
import { parseHex } from './colors'

/**
 * PDF and EPS: the two formats a print shop asks for.
 *
 * Both are vector, both draw with move/line/curve/fill, and both put the origin at the
 * bottom left — so they share the geometry below and differ only in how they spell it.
 * Neither has an arc primitive, so a corner becomes a cubic curve; `KAPPA` is the constant
 * that makes one match a quarter circle to within a rounding error.
 */
const KAPPA = 0.5522847498

/** Millimetres to points. Vector output is sized once, since it scales without loss. */
const MM = 72 / 25.4
const WIDTH_MM = 80

type Seg =
  | { op: 'm' | 'l'; pts: [number, number] }
  | { op: 'c'; pts: [number, number, number, number, number, number] }
  | { op: 'z' }

/** A rounded rectangle as move/line/curve segments, clockwise from the top left. */
function segments(prim: Prim): Seg[] {
  const [tl, tr, br, bl] = clampRadii(prim)
  const { x, y, w, h } = prim
  const out: Seg[] = [{ op: 'm', pts: [x + tl, y] }]

  out.push({ op: 'l', pts: [x + w - tr, y] })
  if (tr) {
    out.push({
      op: 'c',
      pts: [x + w - tr + tr * KAPPA, y, x + w, y + tr - tr * KAPPA, x + w, y + tr],
    })
  }
  out.push({ op: 'l', pts: [x + w, y + h - br] })
  if (br) {
    out.push({
      op: 'c',
      pts: [x + w, y + h - br + br * KAPPA, x + w - br + br * KAPPA, y + h, x + w - br, y + h],
    })
  }
  out.push({ op: 'l', pts: [x + bl, y + h] })
  if (bl) {
    out.push({
      op: 'c',
      pts: [x + bl - bl * KAPPA, y + h, x, y + h - bl + bl * KAPPA, x, y + h - bl],
    })
  }
  out.push({ op: 'l', pts: [x, y + tl] })
  if (tl) {
    out.push({ op: 'c', pts: [x, y + tl - tl * KAPPA, x + tl - tl * KAPPA, y, x + tl, y] })
  }
  out.push({ op: 'z' })
  return out
}

/** Both formats put y upwards; the drawing counts it downwards. */
function flip(height: number, y: number): number {
  return height - y
}

function num(value: number): string {
  return (Math.round(value * 1000) / 1000).toString()
}

function rgb(hex: string): [number, number, number] {
  const parsed = parseHex(hex) ?? [0, 0, 0]
  return parsed.map((channel) => Math.round((channel / 255) * 1000) / 1000) as [
    number,
    number,
    number,
  ]
}

function draw(
  prims: Prim[],
  scale: number,
  height: number,
  ops: Record<Seg['op'], string>,
): string {
  const out: string[] = []
  for (const prim of prims) {
    for (const seg of segments(prim)) {
      if (seg.op === 'z') {
        out.push(ops.z)
        continue
      }
      const coords: string[] = []
      for (let i = 0; i < seg.pts.length; i += 2) {
        coords.push(num(seg.pts[i]! * scale), num(flip(height, seg.pts[i + 1]! * scale)))
      }
      out.push(`${coords.join(' ')} ${ops[seg.op]}`)
    }
  }
  return out.join('\n')
}

// ------------------------------------------------------------------------- PDF

/**
 * A one-page PDF.
 *
 * Written by hand rather than with a library: the whole document is a catalogue, a page,
 * one content stream and a font, and the alternative is 300kB of dependency to draw
 * rectangles. Gradients are real PDF shadings rather than a flattened colour, because a
 * gradient that survives to the screen and not to the printer is the kind of surprise
 * that only shows up after the run is paid for.
 */
export function toPdf(drawing: Drawing, captionWidth: number): Blob {
  // The measurement arrives in the drawing's own units, like everything else here.
  const scale = (WIDTH_MM * MM) / drawing.width
  const pageWidth = drawing.width * scale
  const pageHeight = drawing.height * scale
  const ops = { m: 'm', l: 'l', c: 'c', z: 'h' } as const

  const shadings: string[] = []
  const content: string[] = []

  const fill = (paint: Paint, prims: Prim[], holes: Prim[] | undefined) => {
    const path = draw([...prims, ...(holes ?? [])], scale, pageHeight, ops)
    const rule = holes?.length ? 'f*' : 'f'

    if (!isGradient(paint)) {
      const [r, g, b] = rgb(flatPaint(paint))
      content.push(`${r} ${g} ${b} rg`, path, rule)
      return
    }

    // A shading paints a region rather than a path, so the path becomes a clip for it.
    const name = `Sh${shadings.length}`
    shadings.push(shadingFor(paint, pageWidth, pageHeight, name))
    content.push('q', path, holes?.length ? 'W* n' : 'W n', `/${name} sh`, 'Q')
  }

  if (drawing.background) {
    fill(
      drawing.background.paint,
      [
        {
          x: 0,
          y: 0,
          w: drawing.width,
          h: drawing.height,
          r: Array(4).fill(drawing.background.round * drawing.width) as [
            number,
            number,
            number,
            number,
          ],
        },
      ],
      undefined,
    )
  }

  for (const layer of drawing.layers) fill(layer.paint, layer.prims, layer.holes)

  if (drawing.caption) {
    const [r, g, b] = rgb(flatPaint(drawing.caption.paint))
    const size = drawing.caption.size * scale
    const x = (drawing.caption.x - captionWidth / 2) * scale
    const y = flip(pageHeight, drawing.caption.y * scale)
    content.push(
      'BT',
      `/F1 ${num(size)} Tf`,
      `${r} ${g} ${b} rg`,
      `${num(x)} ${num(y)} Td`,
      `(${escapePdf(drawing.caption.text)}) Tj`,
      'ET',
    )
  }

  const stream = content.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(pageWidth)} ${num(pageHeight)}] ` +
      `/Resources << /Font << /F1 5 0 R >> ` +
      `/Shading << ${shadings.map((_, index) => `/Sh${index} ${6 + index} 0 R`).join(' ')} >> >> ` +
      `/Contents 4 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    ...shadings,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })

  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`

  return new Blob([pdf], { type: 'application/pdf' })
}

/** An axial or radial shading, with a two-stop exponential function between the ends. */
function shadingFor(paint: Paint, width: number, height: number, _name: string): string {
  const [r0, g0, b0] = rgb('from' in paint ? paint.from : '#000000')
  const [r1, g1, b1] = rgb('to' in paint ? paint.to : '#000000')
  const fn = `<< /FunctionType 2 /Domain [0 1] /C0 [${r0} ${g0} ${b0}] /C1 [${r1} ${g1} ${b1}] /N 1 >>`

  if (paint.type === 'radial') {
    const cx = width / 2
    const cy = height / 2
    return (
      `<< /ShadingType 3 /ColorSpace /DeviceRGB /Coords [${num(cx)} ${num(cy)} 0 ${num(cx)} ${num(cy)} ${num(width * 0.72)}] ` +
      `/Function ${fn} /Extend [true true] >>`
    )
  }

  const line = axis(paint, width)
  return (
    `<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [${num(line.x1)} ${num(height - line.y1)} ${num(line.x2)} ${num(height - line.y2)}] ` +
    `/Function ${fn} /Extend [true true] >>`
  )
}

function escapePdf(value: string): string {
  return value.replace(/[\\()]/g, (char) => `\\${char}`)
}

// ------------------------------------------------------------------------- EPS

/**
 * Encapsulated PostScript, for the print shops that still ask for it.
 *
 * PostScript Level 2 has no gradient, so a gradient flattens to its first colour here —
 * the app says so before you download one. It does have `stringwidth`, so unlike the PDF
 * the caption centres itself and needs no measurement passed in.
 */
export function toEps(drawing: Drawing): Blob {
  const scale = (WIDTH_MM * MM) / drawing.width
  const width = drawing.width * scale
  const height = drawing.height * scale
  const ops = { m: 'moveto', l: 'lineto', c: 'curveto', z: 'closepath' } as const

  const body: string[] = []
  const fill = (paint: Paint, prims: Prim[], holes: Prim[] | undefined) => {
    const [r, g, b] = rgb(flatPaint(paint))
    body.push(
      `${r} ${g} ${b} setrgbcolor`,
      'newpath',
      draw([...prims, ...(holes ?? [])], scale, height, ops),
      holes?.length ? 'eofill' : 'fill',
    )
  }

  if (drawing.background) {
    fill(
      drawing.background.paint,
      [
        {
          x: 0,
          y: 0,
          w: drawing.width,
          h: drawing.height,
          r: Array(4).fill(drawing.background.round * drawing.width) as [
            number,
            number,
            number,
            number,
          ],
        },
      ],
      undefined,
    )
  }

  for (const layer of drawing.layers) fill(layer.paint, layer.prims, layer.holes)

  if (drawing.caption) {
    const [r, g, b] = rgb(flatPaint(drawing.caption.paint))
    body.push(
      `${r} ${g} ${b} setrgbcolor`,
      `/Helvetica-Bold findfont ${num(drawing.caption.size * scale)} scalefont setfont`,
      `${num(drawing.caption.x * scale)} ${num(flip(height, drawing.caption.y * scale))} moveto`,
      `(${escapePdf(drawing.caption.text)}) dup stringwidth pop 2 div neg 0 rmoveto show`,
    )
  }

  const eps = [
    '%!PS-Adobe-3.0 EPSF-3.0',
    `%%BoundingBox: 0 0 ${Math.ceil(width)} ${Math.ceil(height)}`,
    '%%Creator: Glyph',
    '%%EndComments',
    ...body,
    'showpage',
    '%%EOF',
    '',
  ].join('\n')

  return new Blob([eps], { type: 'application/postscript' })
}

/** True when a format is about to drop something the drawing has. */
export function vectorLoses(drawing: Drawing): { eps: string[]; pdf: string[] } {
  const gradient = [drawing.background?.paint, ...drawing.layers.map((layer) => layer.paint)].some(
    (paint) => paint && isGradient(paint),
  )
  return {
    pdf: drawing.logo ? ['the logo'] : [],
    eps: [...(drawing.logo ? ['the logo'] : []), ...(gradient ? ['the gradient'] : [])],
  }
}
