import { describe, expect, it } from 'vitest'
import { buildMatrix, type Matrix } from './matrix'
import { solid } from './paint'
import { DEFAULT_STYLE } from './settings'
import { eyeOrigins, logoBox, planDrawing, spanOf, viewBoxOf, type Style } from './render'
import { toSvg } from './emit-svg'

const BASE: Style = DEFAULT_STYLE

function matrixOf(text: string): Matrix {
  const { matrix } = buildMatrix(text, 'M')
  if (!matrix) throw new Error('expected a matrix')
  return matrix
}

function withCaption(style: Style, caption: string): Style {
  return { ...style, frame: { ...style.frame, caption } }
}

describe('spanOf', () => {
  it('is the symbol plus a quiet zone on each side', () => {
    const matrix = matrixOf('hello')
    expect(spanOf(matrix, BASE)).toBe(matrix.size + 8)
    expect(spanOf(matrix, { ...BASE, margin: 0 })).toBe(matrix.size)
  })
})

describe('viewBoxOf', () => {
  it('is square until a caption is added under it', () => {
    const matrix = matrixOf('hello')
    expect(viewBoxOf(matrix, BASE)).toEqual({
      width: spanOf(matrix, BASE),
      height: spanOf(matrix, BASE),
    })

    const captioned = viewBoxOf(matrix, withCaption(BASE, 'Scan me'))
    expect(captioned.width).toBe(spanOf(matrix, BASE))
    expect(captioned.height).toBeGreaterThan(captioned.width)
  })

  it('ignores a caption of nothing but spaces', () => {
    expect(viewBoxOf(matrixOf('hello'), withCaption(BASE, '   '))).toEqual(
      viewBoxOf(matrixOf('hello'), BASE),
    )
  })

  it('grows on every side once a frame is around it', () => {
    const matrix = matrixOf('hello')
    const framed = viewBoxOf(matrix, { ...BASE, frame: { ...BASE.frame, style: 'line' } })
    expect(framed.width).toBe(spanOf(matrix, BASE) + 4)
  })
})

describe('planDrawing', () => {
  it('splits the symbol into data, finder frames and finder centres', () => {
    const matrix = matrixOf('hello')
    const { layers } = planDrawing(matrix, BASE)
    const dark = matrix.bits.filter(Boolean).length

    expect(layers).toHaveLength(3)
    // Each finder is 33 dark modules of the 49 in its 7x7, and there are three of them.
    expect(layers[0]?.prims).toHaveLength(dark - 3 * 33)
    expect(layers[1]?.prims).toHaveLength(3)
    expect(layers[1]?.holes).toHaveLength(3)
    expect(layers[2]?.prims).toHaveLength(3)
  })

  it('merges neighbours into one shape for the bar styles, and not otherwise', () => {
    const matrix = matrixOf('hello')
    const squares = planDrawing(matrix, BASE).layers[0]?.prims.length ?? 0
    const bars = planDrawing(matrix, { ...BASE, module: 'bars-v' }).layers[0]?.prims.length ?? 0
    expect(bars).toBeLessThan(squares)
  })

  it('lets the corners take their own paint, and follow otherwise', () => {
    const matrix = matrixOf('hello')
    const plain = planDrawing(matrix, BASE)
    expect(plain.layers[1]?.paint).toEqual(BASE.paint)

    const painted = planDrawing(matrix, { ...BASE, eyeFramePaint: solid('#ff0000') })
    expect(painted.layers[1]?.paint).toEqual(solid('#ff0000'))
    // The centre follows the frame rather than the code, which is the nearer of the two.
    expect(painted.layers[2]?.paint).toEqual(solid('#ff0000'))
  })

  it('has no background at all when the code is transparent', () => {
    expect(planDrawing(matrixOf('hello'), { ...BASE, transparent: true }).background).toBeNull()
  })

  it('puts the caption above the code when asked, and moves the code down for it', () => {
    const matrix = matrixOf('hello')
    const above = planDrawing(matrix, {
      ...BASE,
      frame: { style: 'none', caption: 'Scan me', position: 'above' },
    })
    const below = planDrawing(matrix, withCaption(BASE, 'Scan me'))

    expect(above.caption?.y).toBeLessThan(below.caption?.y ?? 0)
    expect(above.layers[0]?.prims[0]?.y).toBeGreaterThan(below.layers[0]?.prims[0]?.y ?? 0)
  })

  it('punches the logo out of the data layer rather than drawing over it', () => {
    const matrix = matrixOf('hello')
    const logo = { src: 'data:,', scale: 0.2, margin: 0.5, knockout: true, round: false }
    expect(planDrawing(matrix, { ...BASE, logo }).layers[0]?.holes).toHaveLength(1)
    expect(
      planDrawing(matrix, { ...BASE, logo: { ...logo, knockout: false } }).layers[0]?.holes,
    ).toBeUndefined()
  })
})

describe('logoBox', () => {
  it('is nothing until there is a logo', () => {
    expect(logoBox(matrixOf('hello'), BASE)).toBeNull()
  })

  it('is centred and snapped to whole modules', () => {
    const matrix = matrixOf('hello')
    const box = logoBox(matrix, {
      ...BASE,
      logo: { src: 'data:,', scale: 0.2, margin: 0, knockout: true, round: false },
    })
    if (!box) throw new Error('expected a box')

    // An odd count is the only one that centres exactly on an odd-sized symbol.
    expect(box.size % 2).toBe(1)
    expect(box.x - BASE.margin).toBe(matrix.size - box.size - (box.x - BASE.margin))
  })
})

describe('eyeOrigins', () => {
  it('puts a finder in three of the four corners', () => {
    const matrix = matrixOf('hello')
    expect(eyeOrigins(matrix)).toEqual([
      [0, 0],
      [0, matrix.size - 7],
      [matrix.size - 7, 0],
    ])
  })
})

describe('toSvg', () => {
  it('is a standalone document sized in module units', () => {
    const matrix = matrixOf('hello')
    const svg = toSvg(planDrawing(matrix, BASE))
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    expect(svg).toContain(`viewBox="0 0 ${spanOf(matrix, BASE)} ${spanOf(matrix, BASE)}"`)
    expect(svg.endsWith('</svg>')).toBe(true)
  })

  it('paints the ground, the data and the finders with the chosen colours', () => {
    const svg = toSvg(
      planDrawing(matrixOf('hello'), {
        ...BASE,
        paint: solid('#112233'),
        background: solid('#eeddcc'),
        eyeFramePaint: solid('#ff0000'),
      }),
    )
    expect(svg).toContain('fill="#eeddcc"')
    expect(svg).toContain('fill="#112233"')
    expect(svg).toContain('fill="#ff0000"')
  })

  it('declares a gradient once and points the layer at it', () => {
    const svg = toSvg(
      planDrawing(matrixOf('hello'), {
        ...BASE,
        paint: { type: 'linear', from: '#111111', to: '#eeeeee', angle: 45 },
      }),
    )
    expect(svg).toContain('<linearGradient id="g-1"')
    expect(svg).toContain('fill="url(#g-1)"')
    expect(svg.match(/<linearGradient/g)).toHaveLength(1)
  })

  it('knocks a hole in the code before it puts an image there', () => {
    const svg = toSvg(
      planDrawing(matrixOf('hello'), {
        ...BASE,
        logo: {
          src: 'data:image/png;base64,AAA',
          scale: 0.2,
          margin: 0.5,
          knockout: true,
          round: false,
        },
      }),
    )
    expect(svg).toContain('href="data:image/png;base64,AAA"')
    expect(svg.indexOf('<path')).toBeLessThan(svg.indexOf('<image'))
  })

  it('escapes a caption rather than letting it become markup', () => {
    const svg = toSvg(planDrawing(matrixOf('hello'), withCaption(BASE, 'Tom & "Jo" <b>')))
    expect(svg).toContain('Tom &amp; &quot;Jo&quot; &lt;b&gt;')
    expect(svg).not.toContain('<b>')
  })

  it('takes a pixel width for a file, and none for the preview', () => {
    const matrix = matrixOf('hello')
    expect(toSvg(planDrawing(matrix, BASE), 512)).toContain('width="512" height="512"')
    // A caption makes the file taller than it is wide, and the height follows.
    expect(toSvg(planDrawing(matrix, withCaption(BASE, 'Scan me')), 512)).not.toContain(
      'height="512"',
    )
    expect(toSvg(planDrawing(matrix, BASE)).split('><')[0]).not.toContain('width=')
  })
})
