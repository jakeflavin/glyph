import { describe, expect, it } from 'vitest'
import { parseBulk } from './bulk'

describe('parseBulk', () => {
  it('takes one code per line, and skips the empty ones', () => {
    expect(parseBulk('a\n\n  \nb', false)).toEqual([
      { value: 'a', label: 'a' },
      { value: 'b', label: 'b' },
    ])
  })

  it('reads a second column as the name for the file', () => {
    expect(parseBulk('example.com/1, Table 1', true)).toEqual([
      { value: 'https://example.com/1', label: 'Table 1' },
    ])
  })

  it('accepts a tab as the separator, which is what a spreadsheet pastes', () => {
    expect(parseBulk('example.com/1\tTable 1', true)[0]?.label).toBe('Table 1')
  })

  it('adds a scheme to what looks like a link, and leaves other text alone', () => {
    expect(parseBulk('example.com', true)[0]?.value).toBe('https://example.com')
    expect(parseBulk('Table four', true)[0]?.value).toBe('Table four')
    expect(parseBulk('mailto:a@b.com', true)[0]?.value).toBe('mailto:a@b.com')
  })

  it('leaves everything alone when the list is not links', () => {
    expect(parseBulk('example.com', false)[0]?.value).toBe('example.com')
  })

  it('drops a line that repeats one already in the list', () => {
    expect(parseBulk('a\nb\na', false)).toHaveLength(2)
  })
})
