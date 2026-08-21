/*
 * What each kind of code actually encodes.
 *
 * Every rule here comes from the format a scanner expects, not from a preference. Wi-Fi
 * and vCard both carry delimiters inside user text, so both escape it; getting that wrong
 * produces a code that scans but joins the wrong network or drops half a name.
 */

export type KindId =
  | 'link'
  | 'text'
  | 'wifi'
  | 'contact'
  | 'email'
  | 'sms'
  | 'phone'
  | 'whatsapp'
  | 'event'
  | 'location'
  | 'crypto'

export interface Kind {
  id: KindId
  label: string
  /** Placed under the form, in the app's own voice: what a scanner will do with it. */
  hint: string
}

export const KINDS: [Kind, ...Kind[]] = [
  { id: 'link', label: 'Link', hint: 'Scanning opens the address.' },
  { id: 'text', label: 'Text', hint: 'Scanning shows the text. Nothing opens.' },
  { id: 'wifi', label: 'Wi-Fi', hint: 'Scanning offers to join the network.' },
  { id: 'contact', label: 'Contact', hint: 'Scanning offers to save the contact.' },
  { id: 'email', label: 'Email', hint: 'Scanning opens a draft email.' },
  { id: 'sms', label: 'SMS', hint: 'Scanning opens a draft message.' },
  { id: 'phone', label: 'Phone', hint: 'Scanning offers to call the number.' },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    hint: 'Scanning opens a WhatsApp chat with the message ready.',
  },
  { id: 'event', label: 'Event', hint: 'Scanning offers to put the event in a calendar.' },
  { id: 'location', label: 'Location', hint: 'Scanning opens the point in a maps app.' },
  { id: 'crypto', label: 'Crypto', hint: 'Scanning opens a wallet with the address filled in.' },
]

export interface LinkValue {
  url: string
}
export interface TextValue {
  text: string
}
export interface WifiValue {
  ssid: string
  password: string
  security: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}
export interface ContactValue {
  firstName: string
  lastName: string
  organization: string
  title: string
  phone: string
  email: string
  url: string
  address: string
  note: string
}
export interface EmailValue {
  to: string
  subject: string
  body: string
}
export interface SmsValue {
  number: string
  message: string
}
export interface PhoneValue {
  number: string
}
export interface WhatsappValue {
  number: string
  message: string
}
export interface EventValue {
  title: string
  location: string
  start: string
  end: string
  notes: string
}
export interface LocationValue {
  latitude: string
  longitude: string
  label: string
}
export interface CryptoValue {
  coin: 'bitcoin' | 'ethereum' | 'litecoin'
  address: string
  amount: string
}

export interface Draft {
  link: LinkValue
  text: TextValue
  wifi: WifiValue
  contact: ContactValue
  email: EmailValue
  sms: SmsValue
  phone: PhoneValue
  whatsapp: WhatsappValue
  event: EventValue
  location: LocationValue
  crypto: CryptoValue
}

export const EMPTY_DRAFT: Draft = {
  link: { url: '' },
  text: { text: '' },
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
  contact: {
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    url: '',
    address: '',
    note: '',
  },
  email: { to: '', subject: '', body: '' },
  sms: { number: '', message: '' },
  phone: { number: '' },
  whatsapp: { number: '', message: '' },
  event: { title: '', location: '', start: '', end: '', notes: '' },
  location: { latitude: '', longitude: '', label: '' },
  crypto: { coin: 'bitcoin', address: '', amount: '' },
}

/** One kind's fields, keyed by name — the shape the generic form renders from. */
export type FieldValues = Record<string, string | boolean>

/**
 * The current kind's fields as a plain record.
 *
 * The form is rendered from a table of field names, so at exactly one point a name has to
 * meet its record. Going through entries keeps that point honest: no cast, and a field the
 * table names but the record does not have arrives as `undefined` rather than as a lie.
 */
export function fieldsOf(draft: Draft, kind: KindId): FieldValues {
  return Object.fromEntries(Object.entries(draft[kind]))
}

/**
 * A bare domain is what people type, and a code carrying `example.com` with no scheme is
 * read as text by most scanners. Anything that already names a scheme is left alone, so
 * `mailto:`, `tel:` and an app's own scheme all survive.
 */
export function normalizeUrl(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value
  return `https://${value}`
}

/** Wi-Fi and vCard both treat these as delimiters, so a value containing one escapes it. */
function escapeWifi(value: string): string {
  return value.replace(/([;,:"])/g, '\\$1')
}

function escapeVcard(value: string): string {
  return value.replace(/([;,])/g, '\\$1').replace(/\n/g, '\\n')
}

function vcardLines(contact: ContactValue): string[] {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  const last = escapeVcard(contact.lastName.trim())
  const first = escapeVcard(contact.firstName.trim())
  lines.push(`N:${last};${first};;;`)

  const full = [contact.firstName.trim(), contact.lastName.trim()].filter(Boolean).join(' ')
  if (full) lines.push(`FN:${escapeVcard(full)}`)
  if (contact.organization.trim()) lines.push(`ORG:${escapeVcard(contact.organization.trim())}`)
  if (contact.title.trim()) lines.push(`TITLE:${escapeVcard(contact.title.trim())}`)
  if (contact.phone.trim()) lines.push(`TEL;TYPE=CELL:${escapeVcard(contact.phone.trim())}`)
  if (contact.email.trim()) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(contact.email.trim())}`)
  if (contact.url.trim()) lines.push(`URL:${normalizeUrl(contact.url)}`)
  // A one-line address goes in the street field; the rest of ADR stays empty rather than
  // guessing where a comma separates a city from a postcode.
  if (contact.address.trim())
    lines.push(`ADR;TYPE=WORK:;;${escapeVcard(contact.address.trim())};;;;`)
  if (contact.note.trim()) lines.push(`NOTE:${escapeVcard(contact.note.trim())}`)
  lines.push('END:VCARD')
  return lines
}

/** The exact string that goes into the code, or '' when there is nothing to encode yet. */
export function encode(kind: KindId, draft: Draft): string {
  switch (kind) {
    case 'link':
      return normalizeUrl(draft.link.url)

    case 'text':
      return draft.text.text

    case 'wifi': {
      const { ssid, password, security, hidden } = draft.wifi
      if (!ssid.trim()) return ''
      const parts = [`T:${security}`, `S:${escapeWifi(ssid)}`]
      if (security !== 'nopass') parts.push(`P:${escapeWifi(password)}`)
      if (hidden) parts.push('H:true')
      return `WIFI:${parts.join(';')};;`
    }

    case 'contact': {
      const c = draft.contact
      const hasSomething = Object.values(c).some((value) => value.trim())
      // vCard is a MIME body, and its line break is CRLF. Most scanners forgive a bare
      // newline; the ones that do not silently drop every line after the first.
      return hasSomething ? vcardLines(c).join('\r\n') : ''
    }

    case 'email': {
      const { to, subject, body } = draft.email
      if (!to.trim() && !subject.trim() && !body.trim()) return ''
      const query = [
        subject.trim() && `subject=${encodeURIComponent(subject.trim())}`,
        body.trim() && `body=${encodeURIComponent(body.trim())}`,
      ]
        .filter(Boolean)
        .join('&')
      return `mailto:${to.trim()}${query ? `?${query}` : ''}`
    }

    case 'sms': {
      const { number, message } = draft.sms
      if (!number.trim()) return ''
      // `SMSTO:` is the form Android and iOS both act on; `sms:` with a body is not.
      return message.trim() ? `SMSTO:${number.trim()}:${message.trim()}` : `SMSTO:${number.trim()}`
    }

    case 'phone':
      return draft.phone.number.trim() ? `tel:${draft.phone.number.trim()}` : ''

    case 'whatsapp': {
      const { number, message } = draft.whatsapp
      // wa.me wants the number with no punctuation and no leading plus.
      const digits = number.replace(/\D/g, '')
      if (!digits) return ''
      const query = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''
      return `https://wa.me/${digits}${query}`
    }

    case 'event': {
      const { title, location, start, end, notes } = draft.event
      if (!title.trim() && !start.trim()) return ''
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        title.trim() && `SUMMARY:${escapeVcard(title.trim())}`,
        location.trim() && `LOCATION:${escapeVcard(location.trim())}`,
        start.trim() && `DTSTART:${toIcalStamp(start)}`,
        end.trim() && `DTEND:${toIcalStamp(end)}`,
        notes.trim() && `DESCRIPTION:${escapeVcard(notes.trim())}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].filter(Boolean) as string[]
      return lines.join('\r\n')
    }

    case 'location': {
      const { latitude, longitude, label } = draft.location
      if (!latitude.trim() || !longitude.trim()) return ''
      // A geo: URI is machine format: the separator is a comma and the decimal mark is a
      // point, whatever the reader's locale would prefer.
      const point = `geo:${latitude.trim()},${longitude.trim()}`
      return label.trim()
        ? `${point}?q=${latitude.trim()},${longitude.trim()}(${encodeURIComponent(label.trim())})`
        : point
    }

    case 'crypto': {
      const { coin, address, amount } = draft.crypto
      if (!address.trim()) return ''
      // BIP-21 and the schemes that copied it: the amount is a machine value, so it keeps
      // a point for a decimal mark whatever the reader's locale uses.
      const query = amount.trim() ? `?amount=${amount.trim().replace(',', '.')}` : ''
      return `${coin}:${address.trim()}${query}`
    }
  }
}

/**
 * A local date and time, as iCalendar spells one.
 *
 * `2026-08-21T18:30` from a datetime-local input becomes `20260821T183000`, with no zone
 * suffix — which iCalendar reads as "in whatever zone the reader is in". That is what
 * someone printing a poster for a local event means, and converting to UTC would move the
 * time for everyone who scans it somewhere else.
 */
function toIcalStamp(value: string): string {
  const cleaned = value.trim().replace(/[-:]/g, '')
  return cleaned.length === 13 ? `${cleaned}00` : cleaned
}

/** A short label for a saved code, so history reads as content rather than as a payload. */
export function summarize(kind: KindId, draft: Draft): string {
  switch (kind) {
    case 'link':
      return draft.link.url.trim()
    case 'text':
      return draft.text.text.trim().split('\n')[0] ?? ''
    case 'wifi':
      return draft.wifi.ssid.trim()
    case 'contact':
      return (
        [draft.contact.firstName.trim(), draft.contact.lastName.trim()].filter(Boolean).join(' ') ||
        draft.contact.organization.trim()
      )
    case 'email':
      return draft.email.to.trim() || draft.email.subject.trim()
    case 'sms':
      return draft.sms.number.trim()
    case 'phone':
      return draft.phone.number.trim()
    case 'whatsapp':
      return draft.whatsapp.number.trim()
    case 'event':
      return draft.event.title.trim()
    case 'location':
      return draft.location.label.trim() || draft.location.latitude.trim()
    case 'crypto':
      return draft.crypto.address.trim().slice(0, 16)
  }
}
