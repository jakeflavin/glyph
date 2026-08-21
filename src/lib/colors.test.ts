import { describe, expect, it } from 'vitest'
import {
  GRADIENT_PALETTES,
  PALETTES,
  contrastRatio,
  isLightOnDark,
  normalizeHex,
  parseHex,
  verdictFor,
} from './colors'

describe('parseHex', () => {
  it('takes both lengths, with or without the hash', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255])
    expect(parseHex('000000')).toEqual([0, 0, 0])
    expect(parseHex('#1A2B3C')).toEqual([26, 43, 60])
  })

  it('is nothing for anything that is not a hex colour', () => {
    expect(parseHex('red')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
    expect(parseHex('')).toBeNull()
  })
})

describe('normalizeHex', () => {
  it('expands and lower-cases, so a file never carries two spellings of one colour', () => {
    expect(normalizeHex('#FFF')).toBe('#ffffff')
  })

  it('falls back rather than writing rubbish into a file', () => {
    expect(normalizeHex('rebeccapurple', '#123456')).toBe('#123456')
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for a colour against itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5)
  })

  it('does not depend on which way round the pair is given', () => {
    expect(contrastRatio('#123456', '#eeeeee')).toBeCloseTo(contrastRatio('#eeeeee', '#123456'), 6)
  })
})

describe('verdictFor', () => {
  it('passes every preset, which is the point of them being presets', () => {
    for (const palette of PALETTES) {
      expect({ id: palette.id, verdict: verdictFor(palette.dark, palette.light) }).toEqual({
        id: palette.id,
        verdict: 'good',
      })
    }
  })

  it('passes both ends of every gradient preset, since either end can be the one that fails', () => {
    for (const palette of GRADIENT_PALETTES) {
      for (const [end, colour] of [
        ['from', palette.from],
        ['to', palette.to],
      ] as const) {
        expect({ id: palette.id, end, verdict: verdictFor(colour, '#ffffff') }).toEqual({
          id: palette.id,
          end,
          verdict: 'good',
        })
      }
    }
  })

  it('calls out a pair a camera would struggle with', () => {
    expect(verdictFor('#777777', '#8a8a8a')).toBe('bad')
    expect(verdictFor('#767676', '#ffffff')).toBe('tight')
  })
})

describe('isLightOnDark', () => {
  it('says which way round the code is', () => {
    expect(isLightOnDark('#000000', '#ffffff')).toBe(false)
    expect(isLightOnDark('#ffffff', '#000000')).toBe(true)
  })
})
