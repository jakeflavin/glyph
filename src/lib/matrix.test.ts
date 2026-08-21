import { describe, expect, it } from 'vitest'
import { buildMatrix, isDark } from './matrix'

describe('buildMatrix', () => {
  it('has nothing to draw for empty text', () => {
    expect(buildMatrix('', 'M')).toEqual({ matrix: null, error: null })
  })

  it('grows the version with the content', () => {
    const short = buildMatrix('hi', 'M').matrix
    const long = buildMatrix('hi'.repeat(300), 'M').matrix
    expect(short?.version).toBe(1)
    expect(long?.version).toBeGreaterThan(short?.version ?? 0)
  })

  it('costs version for correction at the same content', () => {
    const low = buildMatrix('the same string, twice over', 'L').matrix
    const high = buildMatrix('the same string, twice over', 'H').matrix
    expect(high?.size).toBeGreaterThan(low?.size ?? 0)
  })

  it('says so rather than throwing when the content cannot fit', () => {
    const result = buildMatrix('x'.repeat(5000), 'H')
    expect(result.matrix).toBeNull()
    expect(result.error).toMatch(/shorten it/i)
  })

  it('puts a finder pattern in each of the three corners', () => {
    const matrix = buildMatrix('finders', 'M').matrix
    if (!matrix) throw new Error('expected a matrix')
    const last = matrix.size - 1
    for (const [row, col] of [
      [0, 0],
      [0, last - 6],
      [last - 6, 0],
    ] as const) {
      // The centre of a finder is dark and the ring around it is light.
      expect(isDark(matrix, row + 3, col + 3)).toBe(true)
      expect(isDark(matrix, row + 1, col + 3)).toBe(false)
    }
  })
})
