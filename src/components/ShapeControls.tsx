import type { Dispatch, SetStateAction } from 'react'
import { primPath } from '@/lib/emit-svg'
import {
  EYE_BALL_SHAPES,
  EYE_FRAME_SHAPES,
  MODULE_SHAPES,
  eyeBall,
  eyeFrame,
  isRun,
  moduleAt,
  runAt,
  type EyeBallShape,
  type EyeFrameShape,
  type ModuleShape,
} from '@/lib/shapes'
import type { Style } from '@/lib/render'
import { Field, Label } from './controls.styled'
import { PaintField } from './PaintField'
import { Tile, TileRow } from './ShapeControls.styled'

export interface ShapeControlsProps {
  style: Style
  onStyle: Dispatch<SetStateAction<Style>>
}

/**
 * The three shapes a code is made of, each picked from a row of samples.
 *
 * The samples are drawn with the same functions that draw the code, so a tile cannot show
 * something the renderer does not produce — which a hand-drawn icon set would, the first
 * time a shape changed.
 *
 * Three rows share one vocabulary, so "Square" appears three times over. Each tile carries
 * the group in its accessible name — "Square corner frame" — which keeps the words on
 * screen short while making the names distinct for anyone reading them in a list.
 */
export function ShapeControls({ style, onStyle }: ShapeControlsProps) {
  const set = (patch: Partial<Style>) => onStyle((current) => ({ ...current, ...patch }))

  return (
    <>
      <Field>
        <Label as="span" id="module-shape-label">
          Modules
        </Label>
        <TileRow role="group" aria-labelledby="module-shape-label">
          {MODULE_SHAPES.map((shape) => (
            <Tile
              key={shape.id}
              type="button"
              aria-label={`${shape.label} modules`}
              aria-pressed={shape.id === style.module}
              onClick={() => set({ module: shape.id })}
            >
              <svg viewBox="0 0 4 4" aria-hidden="true">
                <path d={modulePreview(shape.id)} />
              </svg>
              {shape.label}
            </Tile>
          ))}
        </TileRow>
        <p>Square is what every scanner was built for. The rest are a preference.</p>
      </Field>

      <Field>
        <Label as="span" id="eye-frame-label">
          Corner frame
        </Label>
        <TileRow role="group" aria-labelledby="eye-frame-label">
          {EYE_FRAME_SHAPES.map((shape) => (
            <Tile
              key={shape.id}
              type="button"
              aria-label={`${shape.label} corner frame`}
              aria-pressed={shape.id === style.eyeFrame}
              onClick={() => set({ eyeFrame: shape.id })}
            >
              <svg viewBox="0 0 7 7" aria-hidden="true">
                <path fillRule="evenodd" d={framePreview(shape.id)} />
              </svg>
              {shape.label}
            </Tile>
          ))}
        </TileRow>
      </Field>

      <Field>
        <Label as="span" id="eye-ball-label">
          Corner centre
        </Label>
        <TileRow role="group" aria-labelledby="eye-ball-label">
          {EYE_BALL_SHAPES.map((shape) => (
            <Tile
              key={shape.id}
              type="button"
              aria-label={`${shape.label} corner centre`}
              aria-pressed={shape.id === style.eyeBall}
              onClick={() => set({ eyeBall: shape.id })}
            >
              <svg viewBox="2 2 3 3" aria-hidden="true">
                <path d={ballPreview(shape.id)} />
              </svg>
              {shape.label}
            </Tile>
          ))}
        </TileRow>
        <p>The proportions stay as the spec fixes them. Only the corners move.</p>
      </Field>

      <PaintField
        id="paint-eye-frame"
        label="Corner frame colour"
        paint={style.eyeFramePaint ?? style.paint}
        onChange={(eyeFramePaint) => set({ eyeFramePaint })}
        follow={{
          active: style.eyeFramePaint === null,
          label: 'Match the code',
          onToggle: () =>
            onStyle((current) => ({
              ...current,
              eyeFramePaint: current.eyeFramePaint === null ? current.paint : null,
            })),
        }}
      />

      <PaintField
        id="paint-eye-ball"
        label="Corner centre colour"
        paint={style.eyeBallPaint ?? style.eyeFramePaint ?? style.paint}
        onChange={(eyeBallPaint) => set({ eyeBallPaint })}
        hint="The three square patterns are what a scanner finds first. They can differ."
        follow={{
          active: style.eyeBallPaint === null,
          label: 'Match the frame',
          onToggle: () =>
            onStyle((current) => ({
              ...current,
              eyeBallPaint:
                current.eyeBallPaint === null ? (current.eyeFramePaint ?? current.paint) : null,
            })),
        }}
      />
    </>
  )
}

/** Four modules in a 2x2, which is enough to show whether a shape merges its neighbours. */
function modulePreview(shape: ModuleShape): string {
  if (isRun(shape)) {
    return shape === 'bars-h'
      ? [runAt(shape, 0, 0, 4), runAt(shape, 0, 2, 3)].map(primPath).join('')
      : [runAt(shape, 0, 0, 4), runAt(shape, 2, 0, 3)].map(primPath).join('')
  }
  return [
    moduleAt(shape, 0, 0),
    moduleAt(shape, 1, 0),
    moduleAt(shape, 0, 1),
    moduleAt(shape, 2, 2),
    moduleAt(shape, 3, 1),
  ]
    .map(primPath)
    .join('')
}

function framePreview(shape: EyeFrameShape): string {
  const [outer, hole] = eyeFrame(shape, 0, 0)
  return primPath(outer) + primPath(hole)
}

function ballPreview(shape: EyeBallShape): string {
  return primPath(eyeBall(shape, 0, 0))
}
