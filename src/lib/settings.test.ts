import { describe, expect, it } from 'vitest'
import { EMPTY_DRAFT } from './payloads'
import { solid } from './paint'
import { DEFAULT_STYLE, readDraft, readStyle } from './settings'

describe('readDraft', () => {
  it('is the empty draft for nothing, and for rubbish', () => {
    expect(readDraft(null)).toEqual(EMPTY_DRAFT)
    expect(readDraft('not json')).toEqual(EMPTY_DRAFT)
  })

  it('fills in the fields a stored draft does not have', () => {
    const draft = readDraft(JSON.stringify({ wifi: { ssid: 'Cafe' } }))
    expect(draft.wifi).toEqual({ ...EMPTY_DRAFT.wifi, ssid: 'Cafe' })
    expect(draft.contact).toEqual(EMPTY_DRAFT.contact)
    // A kind that did not exist when the draft was written still has its fields.
    expect(draft.event).toEqual(EMPTY_DRAFT.event)
  })
})

describe('readStyle', () => {
  it('is the default for nothing, and for rubbish', () => {
    expect(readStyle(null)).toEqual(DEFAULT_STYLE)
    expect(readStyle('{')).toEqual(DEFAULT_STYLE)
  })

  it('keeps what was stored and fills in the rest', () => {
    expect(readStyle(JSON.stringify({ margin: 8, round: 0.1 }))).toEqual({
      ...DEFAULT_STYLE,
      margin: 8,
      round: 0.1,
    })
  })

  it('fills in a frame and a logo that were written before their fields existed', () => {
    const style = readStyle(
      JSON.stringify({ frame: { caption: 'Scan me' }, logo: { src: 'data:,', scale: 0.2 } }),
    )
    expect(style.frame).toEqual({ ...DEFAULT_STYLE.frame, caption: 'Scan me' })
    expect(style.logo).toEqual({
      src: 'data:,',
      scale: 0.2,
      margin: 0.5,
      knockout: true,
      round: false,
    })
  })

  describe('from the first build, which had one invert flag', () => {
    it('turns it into the pair of colours it stood for', () => {
      const style = readStyle(JSON.stringify({ margin: 8, invert: true }))
      expect(style.paint).toEqual(solid('#ffffff'))
      expect(style.background).toEqual(solid('#000000'))
      expect(style.margin).toBe(8)
    })
  })

  describe('from the second build, which had hex strings and one eye shape', () => {
    it('turns the colours into paints', () => {
      const style = readStyle(JSON.stringify({ dark: '#0f3b28', light: '#f6efe2', eye: '#5c1024' }))
      expect(style.paint).toEqual(solid('#0f3b28'))
      expect(style.background).toEqual(solid('#f6efe2'))
      expect(style.eyeFramePaint).toEqual(solid('#5c1024'))
    })

    it('splits the one eye shape across the frame and the ball', () => {
      const style = readStyle(JSON.stringify({ shape: 'dot', eyeShape: 'circle' }))
      expect(style.module).toBe('dot')
      expect(style.eyeFrame).toBe('circle')
      expect(style.eyeBall).toBe('circle')
    })

    it('moves a bare caption into the frame', () => {
      expect(readStyle(JSON.stringify({ caption: 'Scan me' })).frame).toEqual({
        ...DEFAULT_STYLE.frame,
        caption: 'Scan me',
      })
    })
  })

  it('drops every legacy key, so a decode is a fixed point', () => {
    for (const legacy of [
      { invert: true },
      { dark: '#123456', light: '#ffffff', shape: 'rounded', eyeShape: 'rounded' },
      { caption: 'Scan me' },
    ]) {
      const once = readStyle(JSON.stringify(legacy))
      for (const key of ['invert', 'dark', 'light', 'eye', 'shape', 'eyeShape', 'caption']) {
        expect({ key, present: key in once }).toEqual({ key, present: false })
      }
      // What the app writes back is what it reads next time. It must not drift.
      expect(readStyle(JSON.stringify(once))).toEqual(once)
    }
  })
})
