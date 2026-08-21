import { describe, expect, it } from 'vitest'
import { DEFAULT_STYLE } from './settings'
import { TEMPLATE_LIMIT, removeTemplate, saveTemplate, type Template } from './templates'

function template(id: string, name: string): Template {
  return { id, name, style: DEFAULT_STYLE }
}

describe('saveTemplate', () => {
  it('puts the newest first', () => {
    const list = saveTemplate([template('1', 'a')], template('2', 'b'))
    expect(list.map((entry) => entry.id)).toEqual(['2', '1'])
  })

  it('replaces one saved under the same name, whatever its case', () => {
    const list = saveTemplate([template('1', 'Cafe'), template('2', 'Shop')], template('3', 'cafe'))
    expect(list.map((entry) => entry.id)).toEqual(['3', '2'])
  })

  it('drops the oldest past the limit', () => {
    let list: Template[] = []
    for (let i = 0; i < TEMPLATE_LIMIT + 2; i += 1)
      list = saveTemplate(list, template(`${i}`, `${i}`))
    expect(list).toHaveLength(TEMPLATE_LIMIT)
  })
})

describe('removeTemplate', () => {
  it('takes out the one asked for', () => {
    expect(removeTemplate([template('1', 'a'), template('2', 'b')], '1')).toHaveLength(1)
  })
})
