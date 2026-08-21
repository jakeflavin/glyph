import { describe, expect, it } from 'vitest'
import { axis, flatten, isGradient, solid, stops, toCss, type Paint } from './paint'

const LINEAR: Paint = { type: 'linear', from: '#112233', to: '#445566', angle: 0 }
const RADIAL: Paint = { type: 'radial', from: '#112233', to: '#445566' }

describe('flatten', () => {
  it('is the colour itself, or the first of the two', () => {
    expect(flatten(solid('#ABCDEF'))).toBe('#abcdef')
    expect(flatten(LINEAR)).toBe('#112233')
    expect(flatten(RADIAL)).toBe('#112233')
  })
})

describe('stops', () => {
  it('is both ends, so a contrast check can consider the worse one', () => {
    expect(stops(solid('#000000'))).toEqual(['#000000', '#000000'])
    expect(stops(LINEAR)).toEqual(['#112233', '#445566'])
  })
})

describe('isGradient', () => {
  it('separates the one that needs a definition from the one that does not', () => {
    expect(isGradient(solid('#000000'))).toBe(false)
    expect(isGradient(LINEAR)).toBe(true)
    expect(isGradient(RADIAL)).toBe(true)
  })
})

describe('axis', () => {
  it('runs left to right at zero degrees', () => {
    const line = axis(LINEAR, 100)
    expect(line.x1).toBeCloseTo(0)
    expect(line.x2).toBeCloseTo(100)
    expect(line.y1).toBeCloseTo(50)
    expect(line.y2).toBeCloseTo(50)
  })

  it('turns clockwise, which is the direction the control reads', () => {
    const line = axis({ ...LINEAR, angle: 90 }, 100)
    expect(line.y1).toBeCloseTo(0)
    expect(line.y2).toBeCloseTo(100)
    expect(line.x1).toBeCloseTo(50)
  })

  it('reaches past the corners at every angle, so no corner runs out of gradient', () => {
    for (let angle = 0; angle < 360; angle += 15) {
      const line = axis({ ...LINEAR, angle }, 100)
      const length = Math.hypot(line.x2 - line.x1, line.y2 - line.y1)
      expect({ angle, covers: length >= 100 }).toEqual({ angle, covers: true })
    }
  })
})

describe('toCss', () => {
  it('describes each kind in something a swatch can use', () => {
    expect(toCss(solid('#123456'))).toBe('#123456')
    expect(toCss(LINEAR)).toContain('linear-gradient')
    expect(toCss(RADIAL)).toContain('radial-gradient')
  })
})
