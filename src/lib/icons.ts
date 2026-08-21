/**
 * A few marks to drop in the middle of a code, for people who do not have a logo file.
 *
 * They are SVG data URLs built here rather than files in `public/`, so a code made with
 * one carries the mark inside the saved settings exactly as an uploaded logo does, and
 * nothing has to be fetched when the code is drawn.
 *
 * Each is drawn on a filled disc, because a bare glyph sitting on the code has no quiet
 * space of its own and reads as damage rather than as a mark.
 */
export interface BuiltInIcon {
  id: string
  label: string
  /** A path in a 24x24 box, in the style of the icon set the rest of the app uses. */
  path: string
}

export const BUILT_IN_ICONS: [BuiltInIcon, ...BuiltInIcon[]] = [
  {
    id: 'wifi',
    label: 'Wi-Fi',
    path: 'M12 18.5a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM8.1 14.6a5.6 5.6 0 0 1 7.8 0M5 11.2a10.2 10.2 0 0 1 14 0M2.2 7.8a14.6 14.6 0 0 1 19.6 0',
  },
  {
    id: 'link',
    label: 'Link',
    path: 'M10 13.5a3.6 3.6 0 0 0 5.4.4l2.4-2.4a3.6 3.6 0 0 0-5.1-5.1l-1.4 1.4M14 10.5a3.6 3.6 0 0 0-5.4-.4l-2.4 2.4a3.6 3.6 0 0 0 5.1 5.1l1.4-1.4',
  },
  {
    id: 'mail',
    label: 'Mail',
    path: 'M3.5 6.5h17v11h-17zM3.5 7l8.5 6 8.5-6',
  },
  {
    id: 'phone',
    label: 'Phone',
    path: 'M7.5 3.5h9v17h-9zM10.5 18h3',
  },
  {
    id: 'cart',
    label: 'Shop',
    path: 'M3.5 4.5h2.2l2.4 10h9.4l2-7H6.6M9.5 19a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2zM16.5 19a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z',
  },
  {
    id: 'pin',
    label: 'Place',
    path: 'M12 21s6.5-6.1 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 14.9 12 21 12 21zM12 12.6a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z',
  },
]

/** The icon as a data URL, drawn in the colours the code is using. */
export function iconDataUrl(icon: BuiltInIcon, ink: string, ground: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
    `<circle cx="12" cy="12" r="12" fill="${ground}"/>` +
    `<path d="${icon.path}" fill="none" stroke="${ink}" stroke-width="1.8" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>` +
    `</svg>`
  // Percent-encoded rather than base64: it stays readable in the saved settings, and it
  // is shorter for markup, which matters when it is going into localStorage.
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
