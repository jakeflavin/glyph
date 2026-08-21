import { isLightOnDark, verdictFor } from '@/lib/colors'
import { ECC_LEVELS, type Ecc } from '@/lib/matrix'
import type { Style } from '@/lib/render'
import { Field, Label, Pair, Range, RangeRow, Segmented } from './controls.styled'
import { Verdict } from './ScanControls.styled'

const ECC_TEXT: Record<Ecc, string> = {
  L: 'Smallest code. Best on a screen, or somewhere clean.',
  M: 'The usual choice. Survives a little wear.',
  Q: 'Denser code. Survives a scuffed sticker.',
  H: 'Densest code. Survives a lot of damage, and covers a logo.',
}

const CONTRAST_TEXT = {
  good: 'Contrast is well clear of what a camera needs.',
  tight: 'Contrast is tight. Test it on a phone before printing a hundred of them.',
  bad: 'Not enough contrast between the two. Most scanners will not find this code.',
} as const

export interface ScanControlsProps {
  ecc: Ecc
  style: Style
  onEcc: (ecc: Ecc) => void
  onStyle: (style: Style) => void
}

/** The two settings that decide whether the thing reads, and the check on the colours. */
export function ScanControls({ ecc, style, onEcc, onStyle }: ScanControlsProps) {
  const verdict = verdictFor(style.dark, style.light)
  const reversed = isLightOnDark(style.dark, style.light)

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
              onChange={(event) => onStyle({ ...style, margin: Number(event.target.value) })}
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
    </>
  )
}
