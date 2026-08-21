import type { Dispatch, SetStateAction } from 'react'
import type { EyeShape, Shape, Style } from '@/lib/render'
import { Field, Label, Pair, Segmented } from './controls.styled'

const MODULE_SHAPES: [{ id: Shape; label: string }, ...{ id: Shape; label: string }[]] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Round' },
  { id: 'dot', label: 'Dots' },
]

const EYE_SHAPES: [{ id: EyeShape; label: string }, ...{ id: EyeShape; label: string }[]] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Round' },
  { id: 'circle', label: 'Circle' },
]

export interface ShapeControlsProps {
  style: Style
  onStyle: Dispatch<SetStateAction<Style>>
}

export function ShapeControls({ style, onStyle }: ShapeControlsProps) {
  return (
    <Pair>
      <Field>
        <Label as="span" id="module-shape-label">
          Modules
        </Label>
        <Segmented role="group" aria-labelledby="module-shape-label">
          {MODULE_SHAPES.map((shape) => (
            <button
              key={shape.id}
              type="button"
              aria-pressed={shape.id === style.shape}
              onClick={() => onStyle((current) => ({ ...current, shape: shape.id }))}
            >
              {shape.label}
            </button>
          ))}
        </Segmented>
        <p>Square is what every scanner was built for. The other two are a preference.</p>
      </Field>

      <Field>
        <Label as="span" id="eye-shape-label">
          Corners
        </Label>
        <Segmented role="group" aria-labelledby="eye-shape-label">
          {EYE_SHAPES.map((shape) => (
            <button
              key={shape.id}
              type="button"
              aria-pressed={shape.id === style.eyeShape}
              onClick={() => onStyle((current) => ({ ...current, eyeShape: shape.id }))}
            >
              {shape.label}
            </button>
          ))}
        </Segmented>
        <p>The proportions stay as the spec fixes them. Only the corner radius moves.</p>
      </Field>
    </Pair>
  )
}
