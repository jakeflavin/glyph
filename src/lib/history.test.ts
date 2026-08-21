import { describe, expect, it } from 'vitest'
import { EMPTY_DRAFT } from './payloads'
import { HISTORY_LIMIT, addEntry, removeEntry, type HistoryEntry } from './history'

function entry(id: string, label: string): HistoryEntry {
  return { id, kind: 'link', label, draft: EMPTY_DRAFT, at: 0 }
}

describe('addEntry', () => {
  it('puts the newest first', () => {
    const list = addEntry([entry('1', 'a')], entry('2', 'b'))
    expect(list.map((item) => item.id)).toEqual(['2', '1'])
  })

  it('moves a repeat of the same code up rather than adding a second row', () => {
    const list = addEntry([entry('1', 'a'), entry('2', 'b')], entry('3', 'a'))
    expect(list.map((item) => item.id)).toEqual(['3', '2'])
  })

  it('keeps the same label under a different kind', () => {
    const list = addEntry([entry('1', 'a')], { ...entry('2', 'a'), kind: 'text' })
    expect(list).toHaveLength(2)
  })

  it('drops the oldest past the limit', () => {
    let list: HistoryEntry[] = []
    for (let i = 0; i < HISTORY_LIMIT + 3; i += 1) list = addEntry(list, entry(`${i}`, `${i}`))
    expect(list).toHaveLength(HISTORY_LIMIT)
    expect(list.at(-1)?.id).toBe('3')
  })
})

describe('removeEntry', () => {
  it('takes out the one asked for', () => {
    const list = removeEntry([entry('1', 'a'), entry('2', 'b')], '1')
    expect(list.map((item) => item.id)).toEqual(['2'])
  })
})
