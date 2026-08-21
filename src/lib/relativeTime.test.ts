import { describe, expect, it } from 'vitest'
import { relativeTime } from './relativeTime'

/*
 * Asserted against Intl rather than against a literal: a hardcoded "3 minutes ago" only
 * passes on a machine whose locale is English, which is the bug this avoids.
 */
const format = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
const MINUTE = 60_000

describe('relativeTime', () => {
  it('says "now" for anything under a minute', () => {
    expect(relativeTime(1_000_000, 1_000_000 + 59_000)).toBe(format.format(0, 'minute'))
  })

  it('steps up through minutes, hours and days', () => {
    const now = 1_000_000_000
    expect(relativeTime(now - 3 * MINUTE, now)).toBe(format.format(-3, 'minute'))
    expect(relativeTime(now - 5 * 60 * MINUTE, now)).toBe(format.format(-5, 'hour'))
    expect(relativeTime(now - 50 * 60 * MINUTE, now)).toBe(format.format(-2, 'day'))
  })

  it('does not run backwards when a clock has moved', () => {
    expect(relativeTime(2_000, 1_000)).toBe(format.format(0, 'minute'))
  })
})
