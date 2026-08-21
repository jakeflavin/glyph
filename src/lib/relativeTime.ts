/** Built once: constructing a formatter costs far more than using one. */
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "3 minutes ago", in the reader's language rather than in English. */
export function relativeTime(at: number, now: number): string {
  const elapsed = Math.max(0, now - at)
  if (elapsed < MINUTE) return relative.format(0, 'minute')
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), 'minute')
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), 'hour')
  return relative.format(-Math.floor(elapsed / DAY), 'day')
}
