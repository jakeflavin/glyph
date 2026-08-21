import type { Draft, KindId } from './payloads'

export interface HistoryEntry {
  id: string
  kind: KindId
  label: string
  draft: Draft
  at: number
}

/** Enough to find this morning's code again, few enough to stay one glance. */
export const HISTORY_LIMIT = 12

/**
 * Newest first, one entry per distinct code.
 *
 * Re-saving the same content moves it to the top rather than adding a second row —
 * otherwise adjusting one field repeatedly fills the whole list with near-duplicates.
 */
export function addEntry(entries: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const rest = entries.filter((item) => !(item.kind === entry.kind && item.label === entry.label))
  return [entry, ...rest].slice(0, HISTORY_LIMIT)
}

export function removeEntry(entries: HistoryEntry[], id: string): HistoryEntry[] {
  return entries.filter((entry) => entry.id !== id)
}
