import { describe, expect, it } from 'vitest'
import { EMPTY_DRAFT } from './payloads'
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
  })
})

describe('readStyle', () => {
  it('is the default for nothing, and for rubbish', () => {
    expect(readStyle(null)).toEqual(DEFAULT_STYLE)
    expect(readStyle('{')).toEqual(DEFAULT_STYLE)
  })

  it('keeps what was stored and fills in the rest', () => {
    expect(readStyle(JSON.stringify({ margin: 8, caption: 'Scan me' }))).toEqual({
      ...DEFAULT_STYLE,
      margin: 8,
      caption: 'Scan me',
    })
  })

  it('turns the old invert flag into the pair of colours it stood for', () => {
    const style = readStyle(JSON.stringify({ margin: 8, invert: true }))
    expect(style.dark).toBe('#ffffff')
    expect(style.light).toBe('#000000')
    expect(style.margin).toBe(8)
  })

  it('drops the flag rather than carrying it, so the swap happens exactly once', () => {
    const once = readStyle(JSON.stringify({ invert: true }))
    expect('invert' in once).toBe(false)
    // What the app writes back is what it reads next time. It must be a fixed point.
    expect(readStyle(JSON.stringify(once))).toEqual(once)
  })

  it('leaves colours alone when both a flag and colours were stored', () => {
    const style = readStyle(JSON.stringify({ invert: true, dark: '#0f3b28', light: '#ffffff' }))
    expect(style.dark).toBe('#0f3b28')
    expect(style.light).toBe('#ffffff')
  })
})
