import { describe, expect, it } from 'vitest'
import { filenameFor } from './download'

describe('filenameFor', () => {
  it('names the file after the code', () => {
    expect(filenameFor('Ada Lovelace', 'contact', 'svg')).toBe('ada-lovelace-qr.svg')
  })

  it('drops the scheme, which is the same on every link', () => {
    expect(filenameFor('https://example.com/menu', 'link', 'png')).toBe('example-com-menu-qr.png')
  })

  it('falls back to the kind when there is nothing to name it after', () => {
    expect(filenameFor('  ', 'wifi', 'svg')).toBe('wifi-qr.svg')
    expect(filenameFor('!!!', 'wifi', 'svg')).toBe('wifi-qr.svg')
  })

  it('stays short enough to read in a downloads list', () => {
    expect(filenameFor('a'.repeat(200), 'text', 'png')).toBe(`${'a'.repeat(40)}-qr.png`)
  })
})
