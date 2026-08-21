import { describe, expect, it } from 'vitest'
import { buildMatrix, type Matrix } from './matrix'
import {
  captionLayout,
  coloursOf,
  dataPath,
  eyeOrigins,
  eyePath,
  logoBox,
  spanOf,
  toSvg,
  viewBoxOf,
  type Style,
} from './render'

const BASE: Style = {
  shape: 'square',
  eyeShape: 'square',
  margin: 4,
  dark: '#000000',
  light: '#ffffff',
  eye: null,
  logo: null,
  caption: '',
}

function matrixOf(text: string): Matrix {
  const { matrix } = buildMatrix(text, 'M')
  if (!matrix) throw new Error('expected a matrix')
  return matrix
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

    const captioned = viewBoxOf(matrix, { ...BASE, caption: 'Scan me' })
    expect(captioned.width).toBe(spanOf(matrix, BASE))
    expect(captioned.height).toBeGreaterThan(captioned.width)
  })

  it('ignores a caption of nothing but spaces', () => {
    const matrix = matrixOf('hello')
    expect(viewBoxOf(matrix, { ...BASE, caption: '   ' })).toEqual(viewBoxOf(matrix, BASE))
  })
})

describe('the two paths', () => {
  it('split the symbol between them: data outside the finders, finders on their own', () => {
    const matrix = matrixOf('hello')
    const dark = matrix.bits.filter(Boolean).length
    const shapes = dataPath(matrix, BASE).split('M').length - 1

    // Each finder is 33 dark modules of the 49 in its 7x7, and there are three of them.
    expect(shapes).toBe(dark - 3 * 33)
    // Three finders, three subpaths each: the ring, its hole, and the centre.
    expect(eyePath(matrix, BASE).split('M').length - 1).toBe(9)
  })

  it('offsets everything by the quiet zone', () => {
    const matrix = matrixOf('hello')
    expect(eyePath(matrix, BASE).startsWith('M4 4')).toBe(true)
    expect(eyePath(matrix, { ...BASE, margin: 0 }).startsWith('M0 0')).toBe(true)
  })

  it('puts a finder in three of the four corners', () => {
    const matrix = matrixOf('hello')
    expect(eyeOrigins(matrix)).toEqual([
      [0, 0],
      [0, matrix.size - 7],
      [matrix.size - 7, 0],
    ])
  })
})

describe('coloursOf', () => {
  it('follows the code colour until the corners are given one', () => {
    expect(coloursOf({ ...BASE, dark: '#123456' }).eye).toBe('#123456')
    expect(coloursOf({ ...BASE, dark: '#123456', eye: '#abcdef' }).eye).toBe('#abcdef')
  })

  it('falls back rather than writing a colour that is not one', () => {
    expect(coloursOf({ ...BASE, dark: 'rubbish' }).dark).toBe('#000000')
    expect(coloursOf({ ...BASE, light: '' }).light).toBe('#ffffff')
  })
})

describe('logoBox', () => {
  it('is nothing until there is a logo', () => {
    expect(logoBox(matrixOf('hello'), BASE)).toBeNull()
  })

  it('is centred and snapped to whole modules', () => {
    const matrix = matrixOf('hello')
    const box = logoBox(matrix, { ...BASE, logo: { src: 'data:,', scale: 0.2 } })
    if (!box) throw new Error('expected a box')

    // An odd count is the only one that centres exactly on an odd-sized symbol.
    expect(box.size % 2).toBe(1)
    expect(Number.isInteger(box.x)).toBe(true)
    // Equal gaps either side is what centred means once everything is a whole module.
    expect(box.x - BASE.margin).toBe(matrix.size - box.size - (box.x - BASE.margin))
  })
})

describe('captionLayout', () => {
  it('sits under the symbol rather than over it', () => {
    const matrix = matrixOf('hello')
    const layout = captionLayout(matrix, { ...BASE, caption: 'Scan me' })
    expect(layout?.y).toBeGreaterThan(spanOf(matrix, BASE))
    expect(layout?.x).toBe(spanOf(matrix, BASE) / 2)
    expect(layout?.text).toBe('Scan me')
  })
})

describe('toSvg', () => {
  it('is a standalone document sized in module units', () => {
    const matrix = matrixOf('hello')
    const svg = toSvg(matrix, BASE)
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    expect(svg).toContain(`viewBox="0 0 ${spanOf(matrix, BASE)} ${spanOf(matrix, BASE)}"`)
    expect(svg.endsWith('</svg>')).toBe(true)
  })

  it('paints the ground, the data and the finders with the chosen colours', () => {
    const svg = toSvg(matrixOf('hello'), {
      ...BASE,
      dark: '#112233',
      light: '#eeddcc',
      eye: '#ff0000',
    })
    expect(svg).toContain('fill="#eeddcc"')
    expect(svg).toContain('fill="#112233"')
    expect(svg).toContain('fill="#ff0000" fill-rule="evenodd"')
  })

  it('knocks a hole in the code before it puts an image there', () => {
    const svg = toSvg(matrixOf('hello'), {
      ...BASE,
      logo: { src: 'data:image/png;base64,AAA', scale: 0.2 },
    })
    expect(svg.indexOf('<rect x=')).toBeLessThan(svg.indexOf('<image'))
    expect(svg).toContain('href="data:image/png;base64,AAA"')
  })

  it('escapes a caption rather than letting it become markup', () => {
    const svg = toSvg(matrixOf('hello'), { ...BASE, caption: 'Tom & "Jo" <b>' })
    expect(svg).toContain('&gt;')
    expect(svg).toContain('Tom &amp; &quot;Jo&quot; &lt;b&gt;')
    expect(svg).not.toContain('<b>')
  })

  it('takes a pixel width for a file, and none for the preview', () => {
    const matrix = matrixOf('hello')
    expect(toSvg(matrix, BASE, 512)).toContain('width="512" height="512"')
    // A caption makes the file taller than it is wide, and the height follows.
    expect(toSvg(matrix, { ...BASE, caption: 'Scan me' }, 512)).not.toContain('height="512"')
    expect(toSvg(matrix, BASE).split('><')[0]).not.toContain('width=')
  })

  it('asks for crisp edges only where the modules have edges to keep', () => {
    expect(toSvg(matrixOf('hello'), BASE)).toContain('shape-rendering="crispEdges"')
    expect(toSvg(matrixOf('hello'), { ...BASE, shape: 'dot' })).not.toContain('shape-rendering')
  })
})
