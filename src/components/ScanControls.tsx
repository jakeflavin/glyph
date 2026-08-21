import type { Dispatch, SetStateAction } from 'react'
import { ECC_LEVELS, type Ecc } from '@/lib/matrix'
import type { Style } from '@/lib/render'
import { Field, Label, Range, RangeRow, Segmented } from './controls.styled'

const ECC_TEXT: Record<Ecc, string> = {
  L: 'Smallest code. Best on a screen, or somewhere clean.',
  M: 'The usual choice. Survives a little wear.',
  Q: 'Denser code. Survives a scuffed sticker.',
  H: 'Densest code. Survives a lot of damage, and covers a logo.',
}

export interface ScanControlsProps {
  ecc: Ecc
  style: Style
  onEcc: (ecc: Ecc) => void
  onStyle: Dispatch<SetStateAction<Style>>
}

/**
 * The two settings that decide whether the thing reads.
 *
 * What they produce — the contrast reading and the read-back — is reported beside the code
 * rather than here, because that is where someone is looking when they change one of
 * these.
 */
export function ScanControls({ ecc, style, onEcc, onStyle }: ScanControlsProps) {
  return (
    <>
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
    </>
  )
}
