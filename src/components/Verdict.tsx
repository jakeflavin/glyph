import { CircleAlert, CircleCheck, Loader } from 'lucide-react'
import { contrastRatio, isLightOnDark } from '@/lib/colors'
import { stops } from '@/lib/paint'
import { paintsOf, type Style } from '@/lib/render'
import type { ScanResult } from '@/lib/scanCheck'
import { Line } from './Verdict.styled'

const CHECK_TEXT: Record<Exclude<ScanResult, 'unsupported'>, string> = {
  ok: 'Read back at 240 px across. This code scans.',
  wrong: 'This read back as something else. Undo the last change.',
  unreadable:
    'This did not read at 240 px across. Ease off the styling, or raise the correction level.',
}

const CONTRAST_TEXT = {
  tight: 'Contrast is tight. Test it on a phone before printing a hundred.',
  bad: 'Not enough contrast between the code and its background.',
} as const

export interface VerdictProps {
  style: Style
  check: ScanResult | null
  checking: boolean
}

/**
 * Whether the thing works, said beside the thing.
 *
 * Two checks, one line each, and only when there is something to say: a code that reads
 * and has contrast to spare gets one quiet line rather than a panel of green ticks.
 */
export function Verdict({ style, check, checking }: VerdictProps) {
  const { code, ground } = paintsOf(style)
  const contrast = worstContrast(code, ground)
  const reversed = stops(code).every((tone) => isLightOnDark(tone, stops(ground)[0]))

  const contrastNote =
    contrast < 4
      ? CONTRAST_TEXT.bad
      : contrast < 7
        ? CONTRAST_TEXT.tight
        : reversed
          ? 'Light on dark, which a few older scanners refuse.'
          : ''

  return (
    <>
      {check !== 'unsupported' && (
        <Line $level={checking || !check ? 'wait' : check === 'ok' ? 'good' : 'bad'} role="status">
          {checking || !check ? (
            <>
              <Loader aria-hidden="true" /> Reading the code back&hellip;
            </>
          ) : (
            <>
              {check === 'ok' ? (
                <CircleCheck aria-hidden="true" />
              ) : (
                <CircleAlert aria-hidden="true" />
              )}
              {CHECK_TEXT[check]}
            </>
          )}
        </Line>
      )}

      {contrastNote && (
        <Line $level={contrast < 4 ? 'bad' : 'wait'} role="status">
          <CircleAlert aria-hidden="true" /> {contrastNote}
        </Line>
      )}
    </>
  )
}

/**
 * The worst pair of colours in play.
 *
 * A gradient has two ends and either of them can be the one that fails, so both are
 * measured against both ends of the background rather than trusting the first stop.
 */
function worstContrast(code: Parameters<typeof stops>[0], ground: Parameters<typeof stops>[0]) {
  let worst = 21
  for (const ink of stops(code)) {
    for (const paper of stops(ground)) worst = Math.min(worst, contrastRatio(ink, paper))
  }
  return worst
}
