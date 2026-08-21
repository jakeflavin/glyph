import { describe, expect, it } from 'vitest'
import {
  EYE_BALL_SHAPES,
  EYE_FRAME_SHAPES,
  MODULE_SHAPES,
  box,
  clampRadii,
  disc,
  eyeBall,
  eyeFrame,
  isRun,
  moduleAt,
  runAt,
} from './shapes'

describe('clampRadii', () => {
  it('never lets a corner exceed half the side it sits on', () => {
    expect(clampRadii(box(0, 0, 2, 2, 5))).toEqual([1, 1, 1, 1])
    expect(clampRadii(box(0, 0, 1, 4, 2))).toEqual([0.5, 0.5, 0.5, 0.5])
  })

  it('leaves a radius that fits alone, and floors a negative one', () => {
    expect(clampRadii(box(0, 0, 4, 4, [1, 0, -3, 2]))).toEqual([1, 0, 0, 2])
  })
})

describe('disc', () => {
  it('is the rounded rectangle whose radii are half its side', () => {
    expect(disc(5, 5, 2)).toEqual({ x: 3, y: 3, w: 4, h: 4, r: [2, 2, 2, 2] })
  })
})

describe('moduleAt', () => {
  it('gives every shape a one-module footprint at the position asked for', () => {
    for (const shape of MODULE_SHAPES) {
      const prim = moduleAt(shape.id, 3, 5)
      expect({ id: shape.id, fits: prim.w <= 1 && prim.h <= 1 }).toEqual({
        id: shape.id,
        fits: true,
      })
      expect(prim.x).toBeGreaterThanOrEqual(3)
      expect(prim.x + prim.w).toBeLessThanOrEqual(4)
      expect(prim.y).toBeGreaterThanOrEqual(5)
      expect(prim.y + prim.h).toBeLessThanOrEqual(6)
    }
  })
})

describe('runAt', () => {
  it('covers the whole run in the direction it runs, and one module across', () => {
    const across = runAt('bars-h', 2, 4, 5)
    expect(across.w).toBe(5)
    expect(across.h).toBeLessThanOrEqual(1)

    const down = runAt('bars-v', 2, 4, 5)
    expect(down.h).toBe(5)
    expect(down.w).toBeLessThanOrEqual(1)
  })
})

describe('isRun', () => {
  it('is true for exactly the two shapes that merge their neighbours', () => {
    expect(MODULE_SHAPES.filter((shape) => isRun(shape.id)).map((shape) => shape.id)).toEqual([
      'bars-v',
      'bars-h',
    ])
  })
})

describe('the finder patterns', () => {
  it('keeps the proportions the spec fixes, whatever the shape', () => {
    for (const shape of EYE_FRAME_SHAPES) {
      const [outer, hole] = eyeFrame(shape.id, 10, 20)
      expect({ id: shape.id, outer: outer.w, hole: hole.w }).toEqual({
        id: shape.id,
        outer: 7,
        hole: 5,
      })
      expect(outer.x).toBe(10)
      expect(hole.x).toBe(11)
    }
  })

  it('centres every centre inside the frame', () => {
    for (const shape of EYE_BALL_SHAPES) {
      const ball = eyeBall(shape.id, 10, 20)
      expect({ id: shape.id, cx: ball.x + ball.w / 2, cy: ball.y + ball.h / 2 }).toEqual({
        id: shape.id,
        cx: 13.5,
        cy: 23.5,
      })
    }
  })
})
