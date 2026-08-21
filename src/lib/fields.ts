import type { KindId } from './payloads'

/**
 * The form, as data.
 *
 * One table owns which fields each kind has, so adding a kind is an entry here and an arm
 * in `encode` rather than an edit to the form component.
 */
export interface FieldSpec {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox'
  placeholder?: string
  inputMode?: 'text' | 'url' | 'email' | 'tel'
  autoComplete?: string
  options?: [Option, ...Option[]]
  /** Takes the whole row in the two-column grid. Anything long or freeform does. */
  wide?: boolean
}

interface Option {
  value: string
  label: string
}

export const FIELDS: Record<KindId, [FieldSpec, ...FieldSpec[]]> = {
  link: [
    {
      name: 'url',
      label: 'Address',
      type: 'text',
      placeholder: 'example.com/menu',
      inputMode: 'url',
      autoComplete: 'url',
      wide: true,
    },
  ],
  text: [
    {
      name: 'text',
      label: 'Text',
      type: 'textarea',
      placeholder: 'Anything. It is stored in the code itself.',
      wide: true,
    },
  ],
  wifi: [
    { name: 'ssid', label: 'Network name', type: 'text', placeholder: 'Cafe guest' },
    { name: 'password', label: 'Password', type: 'text', placeholder: 'Leave empty if open' },
    {
      name: 'security',
      label: 'Security',
      type: 'select',
      options: [
        { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
        { value: 'WEP', label: 'WEP' },
        { value: 'nopass', label: 'None' },
      ],
    },
    { name: 'hidden', label: 'Network does not broadcast its name', type: 'checkbox' },
  ],
  contact: [
    { name: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name' },
    { name: 'lastName', label: 'Last name', type: 'text', autoComplete: 'family-name' },
    { name: 'organization', label: 'Organisation', type: 'text' },
    { name: 'title', label: 'Job title', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text', inputMode: 'tel', autoComplete: 'tel' },
    { name: 'email', label: 'Email', type: 'text', inputMode: 'email', autoComplete: 'email' },
    { name: 'url', label: 'Website', type: 'text', inputMode: 'url' },
    { name: 'address', label: 'Address', type: 'text', wide: true },
    { name: 'note', label: 'Note', type: 'textarea', wide: true },
  ],
  email: [
    {
      name: 'to',
      label: 'To',
      type: 'text',
      placeholder: 'hello@example.com',
      inputMode: 'email',
      wide: true,
    },
    { name: 'subject', label: 'Subject', type: 'text', wide: true },
    { name: 'body', label: 'Message', type: 'textarea', wide: true },
  ],
  sms: [
    {
      name: 'number',
      label: 'Number',
      type: 'text',
      placeholder: '+1 555 0100',
      inputMode: 'tel',
      wide: true,
    },
    { name: 'message', label: 'Message', type: 'textarea', wide: true },
  ],
  phone: [
    {
      name: 'number',
      label: 'Number',
      type: 'text',
      placeholder: '+1 555 0100',
      inputMode: 'tel',
      wide: true,
    },
  ],
}
