import { normalizeUrl } from './payloads'

export interface BulkItem {
  /** What goes in the code. */
  value: string
  /** What names the file. */
  label: string
}

/**
 * A pasted list, one code per line.
 *
 * Two columns are allowed, separated by a comma or a tab: the second is the filename, so
 * a sheet of table numbers comes out as `table-4.png` rather than as the URL. A line with
 * one column names itself.
 *
 * Lines are treated as links when they look like one, because that is what a pasted list
 * almost always is — but a line that is plainly not a URL is left alone rather than having
 * `https://` stapled to the front of it.
 */
export function parseBulk(input: string, asLinks: boolean): BulkItem[] {
  const seen = new Set<string>()
  const items: BulkItem[] = []

  for (const line of input.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const [first, ...rest] = trimmed.split(/[\t,]/)
    const raw = (first ?? '').trim()
    if (!raw) continue

    const value = asLinks && looksLikeUrl(raw) ? normalizeUrl(raw) : raw
    if (seen.has(value)) continue
    seen.add(value)

    items.push({ value, label: rest.join(',').trim() || raw })
  }

  return items
}

function looksLikeUrl(value: string): boolean {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return true
  return /^[\w-]+(\.[\w-]+)+([/?#]|$)/.test(value)
}

/** Enough for a sheet of table tents; beyond it the tab locks up while it draws. */
export const BULK_LIMIT = 250
