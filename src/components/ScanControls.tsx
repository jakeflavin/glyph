import type { Dispatch, SetStateAction } from 'react'
import { CheckCircle2, CircleAlert, Loader } from 'lucide-react'
import { contrastRatio, isLightOnDark, type ContrastVerdict } from '@/lib/colors'
import { stops } from '@/lib/paint'
import { ECC_LEVELS, type Ecc } from '@/lib/matrix'
import { paintsOf, type Style } from '@/lib/render'
import type { ScanResult } from '@/lib/scanCheck'
import { Field, Label, Pair, Range, RangeRow, Segmented } from './controls.styled'
import { Check, Verdict } from './ScanControls.styled'

const ECC_TEXT: Record<Ecc, string> = {
  L: 'Smallest code. Best on a screen, or somewhere clean.',
  M: 'The usual choice. Survives a little wear.',
  Q: 'Denser code. Survives a scuffed sticker.',
  H: 'Densest code. Survives a lot of damage, and covers a logo.',
}

const CONTRAST_TEXT: Record<ContrastVerdict, string> = {
  good: 'Contrast is well clear of what a camera needs.',
  tight: 'Contrast is tight. Test it on a phone before printing a hundred of them.',
  bad: 'Not enough contrast between the code and its background. Most scanners will not find this.',
}

const CHECK_TEXT: Record<Exclude<ScanResult, 'unsupported'>, string> = {
  ok: 'Read back at 240 pixels across. This code scans.',
  wrong: 'This decoded as something else. Change the style back and tell me.',
  unreadable:
    'This did not read at 240 pixels across. Ease off the styling, or raise the correction level.',
}

export interface ScanControlsProps {
  ecc: Ecc
  style: Style
  /** Null while nothing has been checked yet, which is also the empty state. */
  check: ScanResult | null
  checking: boolean
  onEcc: (ecc: Ecc) => void
  onStyle: Dispatch<SetStateAction<Style>>
}

/** The settings that decide whether the thing reads, and the two checks on them. */
export function ScanControls({ ecc, style, check, checking, onEcc, onStyle }: ScanControlsProps) {
  const { code, ground } = paintsOf(style)
  const verdict = worstVerdict(code, ground)
  const reversed = stops(code).every((tone) => isLightOnDark(tone, stops(ground)[0]))

  return (
    <>
      <Pair>
        <Field>
          <Label as="span" id="ecc-label">
            Error correction
          </Label>
          <Segmented role="group" aria-labelledby="ecc-label">
            {ECC_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={level === ecc}
                onClick={() => onEcc(level)}
              >
                {level}
              </button>
            ))}
          </Segmented>
          <p>{ECC_TEXT[ecc]}</p>
        </Field>

        <Field>
          <Label htmlFor="margin">Quiet zone</Label>
          <RangeRow>
            <Range
              id="margin"
              type="range"
              min={0}
              max={8}
              step={1}
              value={style.margin}
              onChange={(event) =>
                onStyle((current) => ({ ...current, margin: Number(event.target.value) }))
              }
            />
            <span>{style.margin}</span>
          </RangeRow>
          <p>
            The blank border. The spec asks for four modules, and under that some scanners stop
            finding the code at all.
          </p>
        </Field>
      </Pair>

      <Verdict $level={verdict} role="status">
        {CONTRAST_TEXT[verdict]}
        {reversed && ' It is also light on dark, which a few older scanners refuse.'}
      </Verdict>

      {check !== 'unsupported' && (
        <Check $level={check === 'ok' ? 'good' : check ? 'bad' : 'good'} role="status">
          {checking || !check ? (
            <>
              <Loader aria-hidden="true" /> Reading the code back&hellip;
            </>
          ) : (
            <>
              {check === 'ok' ? (
                <CheckCircle2 aria-hidden="true" />
              ) : (
                <CircleAlert aria-hidden="true" />
              )}
              {CHECK_TEXT[check]}
            </>
          )}
        </Check>
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
function worstVerdict(code: Parameters<typeof stops>[0], ground: Parameters<typeof stops>[0]) {
  let worst = 21
  for (const ink of stops(code)) {
    for (const paper of stops(ground)) worst = Math.min(worst, contrastRatio(ink, paper))
  }
  if (worst >= 7) return 'good' as const
  if (worst >= 4) return 'tight' as const
  return 'bad' as const
}
