import { ECC_LEVELS, type Ecc } from '@/lib/matrix'
import type { Shape, Style } from '@/lib/render'
import { Checkbox, Label, Segmented } from './controls.styled'
import { Group, Panel, Range, RangeRow } from './StylePanel.styled'

const SHAPES: [{ id: Shape; label: string }, ...{ id: Shape; label: string }[]] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'dot', label: 'Dots' },
]

const ECC_TEXT: Record<Ecc, string> = {
  L: 'Smallest code. Best on a screen or somewhere clean.',
  M: 'The usual choice. Survives a little wear.',
  Q: 'Denser code. Survives a scuffed sticker.',
  H: 'Densest code. Survives a lot of damage.',
}

export interface StylePanelProps {
  ecc: Ecc
  style: Style
  onEcc: (ecc: Ecc) => void
  onStyle: (style: Style) => void
}

/** Everything about how the code looks. Nothing here changes what it says. */
export function StylePanel({ ecc, style, onEcc, onStyle }: StylePanelProps) {
  return (
    <Panel aria-label="Appearance">
      <Group>
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
      </Group>

      <Group>
        <Label as="span" id="shape-label">
          Modules
        </Label>
        <Segmented role="group" aria-labelledby="shape-label">
          {SHAPES.map((shape) => (
            <button
              key={shape.id}
              type="button"
              aria-pressed={shape.id === style.shape}
              onClick={() => onStyle({ ...style, shape: shape.id })}
            >
              {shape.label}
            </button>
          ))}
        </Segmented>
        <p>Square is what every scanner was built for. The other two are a preference.</p>
      </Group>

      <Group>
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
          finding the code.
        </p>
      </Group>

      <Group>
        <Checkbox htmlFor="invert">
          <input
            id="invert"
            type="checkbox"
            checked={style.invert}
            onChange={(event) => onStyle({ ...style, invert: event.target.checked })}
          />
          White on black
        </Checkbox>
        <p>Most scanners read it. Some older ones do not, so test before you print it.</p>
      </Group>
    </Panel>
  )
}
