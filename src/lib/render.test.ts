import { describe, expect, it } from 'vitest'
import { buildMatrix, type Matrix } from './matrix'
import { modulesPath, spanOf, toSvg, type Style } from './render'

const SQUARE: Style = { shape: 'square', margin: 4, invert: false }

function matrixOf(text: string): Matrix {
  const { matrix } = buildMatrix(text, 'M')
  if (!matrix) throw new Error('expected a matrix')
  return matrix
}

describe('spanOf', () => {
  it('is the symbol plus a quiet zone on each side', () => {
    const matrix = matrixOf('hello')
    expect(spanOf(matrix, SQUARE)).toBe(matrix.size + 8)
    expect(spanOf(matrix, { ...SQUARE, margin: 0 })).toBe(matrix.size)
  })
})

describe('modulesPath', () => {
  it('draws one shape per dark module', () => {
    const matrix = matrixOf('hello')
    const dark = matrix.bits.filter(Boolean).length
    expect(modulesPath(matrix, SQUARE).split('M').length - 1).toBe(dark)
  })

  it('offsets every module by the quiet zone', () => {
    const matrix = matrixOf('hello')
    // The top-left module of a finder pattern is always dark, so it is always the first.
    expect(modulesPath(matrix, SQUARE).startsWith('M4 4')).toBe(true)
    expect(modulesPath(matrix, { ...SQUARE, margin: 0 }).startsWith('M0 0')).toBe(true)
  })
})

describe('toSvg', () => {
  it('is a standalone document sized in module units', () => {
    const svg = toSvg(matrixOf('hello'), SQUARE)
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    expect(svg).toContain(`viewBox="0 0 ${spanOf(matrixOf('hello'), SQUARE)}`)
    expect(svg.endsWith('</svg>')).toBe(true)
  })

  it('swaps the two colours when inverted, and nothing else', () => {
    const normal = toSvg(matrixOf('hello'), SQUARE)
    const inverted = toSvg(matrixOf('hello'), { ...SQUARE, invert: true })
    expect(normal).toContain('<rect width')
    expect(normal).toContain('fill="#ffffff"/>')
    expect(inverted).toContain('<rect width')
    expect(inverted).toContain('fill="#000000"/>')
    expect(modulesPath(matrixOf('hello'), SQUARE)).toBe(
      modulesPath(matrixOf('hello'), { ...SQUARE, invert: true }),
    )
  })

  it('takes a pixel size for a file, and none for the preview', () => {
    expect(toSvg(matrixOf('hello'), SQUARE, 512)).toContain('29" width="512" height="512"')
    // Unsized, the preview's CSS decides how big it is. The background rect still has a
    // width, so the check is on the <svg> tag rather than on the string as a whole.
    expect(toSvg(matrixOf('hello'), SQUARE).split('><')[0]).not.toContain('width=')
  })

  it('asks for crisp edges only where the modules have edges to keep', () => {
    expect(toSvg(matrixOf('hello'), SQUARE)).toContain('shape-rendering="crispEdges"')
    expect(toSvg(matrixOf('hello'), { ...SQUARE, shape: 'dot' })).not.toContain('shape-rendering')
  })
})
