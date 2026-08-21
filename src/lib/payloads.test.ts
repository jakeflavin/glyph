import { describe, expect, it } from 'vitest'
import { FIELDS } from './fields'
import {
  EMPTY_DRAFT,
  KINDS,
  encode,
  fieldsOf,
  normalizeUrl,
  summarize,
  type Draft,
} from './payloads'

/** A draft with one kind filled in, so a test says only what it is about. */
function draftWith(patch: Partial<Draft>): Draft {
  return { ...structuredClone(EMPTY_DRAFT), ...patch }
}

describe('normalizeUrl', () => {
  it('adds https to a bare domain, which is what people type', () => {
    expect(normalizeUrl('example.com/menu')).toBe('https://example.com/menu')
  })

  it('leaves any scheme alone', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
    expect(normalizeUrl('mailto:a@b.com')).toBe('mailto:a@b.com')
    expect(normalizeUrl('myapp://open')).toBe('myapp://open')
  })

  it('is empty for empty input', () => {
    expect(normalizeUrl('   ')).toBe('')
  })
})

describe('encode', () => {
  it('is empty until there is something to encode', () => {
    for (const kind of KINDS) expect(encode(kind.id, EMPTY_DRAFT)).toBe('')
  })

  it('escapes the delimiters inside a wifi value', () => {
    const draft = draftWith({
      wifi: { ssid: 'Cafe; guest', password: 'pa,ss:word"', security: 'WPA', hidden: false },
    })
    expect(encode('wifi', draft)).toBe('WIFI:T:WPA;S:Cafe\\; guest;P:pa\\,ss\\:word\\";;')
  })

  it('drops the password for an open network', () => {
    const draft = draftWith({
      wifi: { ssid: 'Free', password: 'ignored', security: 'nopass', hidden: false },
    })
    expect(encode('wifi', draft)).toBe('WIFI:T:nopass;S:Free;;')
  })

  it('marks a hidden network', () => {
    const draft = draftWith({
      wifi: { ssid: 'Quiet', password: 'x', security: 'WPA', hidden: true },
    })
    expect(encode('wifi', draft)).toContain(';H:true;')
  })

  it('writes a vCard with CRLF breaks and escaped commas', () => {
    const draft = draftWith({
      contact: {
        ...EMPTY_DRAFT.contact,
        firstName: 'Ada',
        lastName: 'Lovelace, Jr.',
        url: 'ada.example',
      },
    })
    const payload = encode('contact', draft)
    expect(payload.split('\r\n')).toEqual([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Lovelace\\, Jr.;Ada;;;',
      'FN:Ada Lovelace\\, Jr.',
      'URL:https://ada.example',
      'END:VCARD',
    ])
  })

  it('leaves out every contact field that was not filled in', () => {
    const draft = draftWith({ contact: { ...EMPTY_DRAFT.contact, organization: 'Acme' } })
    expect(encode('contact', draft)).not.toContain('TEL')
  })

  it('percent-encodes an email subject and body', () => {
    const draft = draftWith({
      email: { to: 'hi@example.com', subject: 'Table 4', body: 'a & b' },
    })
    expect(encode('email', draft)).toBe('mailto:hi@example.com?subject=Table%204&body=a%20%26%20b')
  })

  it('uses SMSTO, which is the form both phones act on', () => {
    const draft = draftWith({ sms: { number: '+15550100', message: 'Table 4' } })
    expect(encode('sms', draft)).toBe('SMSTO:+15550100:Table 4')
  })

  it('needs only a number for sms and phone', () => {
    expect(encode('sms', draftWith({ sms: { number: '+15550100', message: '' } }))).toBe(
      'SMSTO:+15550100',
    )
    expect(encode('phone', draftWith({ phone: { number: '+15550100' } }))).toBe('tel:+15550100')
  })
})

describe('summarize', () => {
  it('takes the first line of a block of text', () => {
    const draft = draftWith({ text: { text: 'Opening hours\nMonday to Friday' } })
    expect(summarize('text', draft)).toBe('Opening hours')
  })

  it('falls back to the organisation when a contact has no name', () => {
    const draft = draftWith({ contact: { ...EMPTY_DRAFT.contact, organization: 'Acme' } })
    expect(summarize('contact', draft)).toBe('Acme')
  })
})

describe('the field table', () => {
  /*
   * The form renders from a table of field names, and `fieldsOf` is the one place a name
   * meets its record. A name in the table that the record does not have would render an
   * uncontrolled input that silently drops what is typed into it — so it is checked here
   * rather than at runtime.
   */
  it('names only fields the draft actually has', () => {
    for (const kind of KINDS) {
      const values = fieldsOf(EMPTY_DRAFT, kind.id)
      for (const field of FIELDS[kind.id]) {
        expect({ kind: kind.id, field: field.name, known: field.name in values }).toEqual({
          kind: kind.id,
          field: field.name,
          known: true,
        })
      }
    }
  })

  it('covers every field the draft has', () => {
    for (const kind of KINDS) {
      const named = FIELDS[kind.id].map((field) => field.name).sort()
      expect(named).toEqual(Object.keys(fieldsOf(EMPTY_DRAFT, kind.id)).sort())
    }
  })
})
