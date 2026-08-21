import { toCss, type Paint } from '@/lib/paint'
import { Field, Label, Segmented } from './controls.styled'
import { Angle, Row, Swatch, Well } from './PaintField.styled'

export interface PaintFieldProps {
  id: string
  label: string
  paint: Paint
  onChange: (paint: Paint) => void
  /** Rendered under the control, in the app's own voice. */
  hint?: string
  /** The corner paints can follow the code's rather than being set at all. */
  follow?: { active: boolean; label: string; onToggle: () => void }
}

const TYPES: [{ id: Paint['type']; label: string }, ...{ id: Paint['type']; label: string }[]] = [
  { id: 'solid', label: 'Flat' },
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
]

/**
 * One fill: a flat colour, or two with a direction.
 *
 * The same control four times over — the code, the ground, and the two halves of a finder
 * pattern — because they are the same decision each time and a reader should only have to
 * learn it once.
 */
export function PaintField({ id, label, paint, onChange, hint, follow }: PaintFieldProps) {
  const disabled = follow?.active ?? false
  const from = paint.type === 'solid' ? paint.color : paint.from
  const to = paint.type === 'solid' ? paint.color : paint.to

  const retype = (type: Paint['type']) => {
    if (type === 'solid') return onChange({ type: 'solid', color: from })
    if (type === 'radial') return onChange({ type: 'radial', from, to })
    onChange({ type: 'linear', from, to, angle: paint.type === 'linear' ? paint.angle : 45 })
  }

  return (
    <Field>
      <Label as="span" id={`${id}-label`}>
        {label}
      </Label>

      <Row>
        <Swatch aria-hidden="true" $css={toCss(paint)} $muted={disabled} />

        <Well $muted={disabled}>
          <input
            id={id}
            type="color"
            aria-label={paint.type === 'solid' ? label : `${label}, first colour`}
            value={from}
            disabled={disabled}
            onChange={(event) =>
              onChange(
                paint.type === 'solid'
                  ? { type: 'solid', color: event.target.value }
                  : { ...paint, from: event.target.value },
              )
            }
          />
          <output>{from.toUpperCase()}</output>
        </Well>

        {paint.type !== 'solid' && (
          <Well $muted={disabled}>
            <input
              id={`${id}-to`}
              type="color"
              aria-label={`${label}, second colour`}
              value={to}
              disabled={disabled}
              onChange={(event) => onChange({ ...paint, to: event.target.value })}
            />
            <output>{to.toUpperCase()}</output>
          </Well>
        )}
      </Row>

      <Row>
        <Segmented role="group" aria-labelledby={`${id}-label`}>
          {TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              // Four of these on one screen, all reading "Flat / Linear / Radial".
              aria-label={`${label}: ${type.label}`}
              aria-pressed={paint.type === type.id}
              disabled={disabled}
              onClick={() => retype(type.id)}
            >
              {type.label}
            </button>
          ))}
        </Segmented>

        {follow && (
          <button
            type="button"
            className="follow"
            aria-pressed={follow.active}
            onClick={follow.onToggle}
          >
            {follow.label}
          </button>
        )}
      </Row>

      {paint.type === 'linear' && !disabled && (
        <Angle>
          <label htmlFor={`${id}-angle`}>Angle</label>
          <input
            id={`${id}-angle`}
            type="range"
            min={0}
            max={350}
            step={10}
            value={paint.angle}
            onChange={(event) => onChange({ ...paint, angle: Number(event.target.value) })}
          />
          <span>{paint.angle}&deg;</span>
        </Angle>
      )}

      {hint && <p>{hint}</p>}
    </Field>
  )
}
