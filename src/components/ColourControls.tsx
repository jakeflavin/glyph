import type { Dispatch, SetStateAction } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { PALETTES } from '@/lib/colors'
import { solid, toCss, type Paint } from '@/lib/paint'
import type { Style } from '@/lib/render'
import { Button, Checkbox, Field, Label, Pair, Range, RangeRow } from './controls.styled'
import { PaintField } from './PaintField'
import { Preset, PresetRow, Row } from './ColourControls.styled'

/** Built once: constructing a formatter costs far more than using one. */
const percent = new Intl.NumberFormat(undefined, { style: 'percent' })

export interface ColourControlsProps {
  style: Style
  /**
   * An updater rather than a value, in every panel that writes to the style.
   *
   * Two of these controls can be driven in one tick — by a test, by a script, by a
   * keyboard repeat — and a handler built from a value would write a style it read
   * before the other one landed, silently dropping it.
   */
  onStyle: Dispatch<SetStateAction<Style>>
}

/**
 * Colour for the code.
 *
 * The app itself stays black and white. Every hue on the page belongs to the thing being
 * made, which is the same rule the other apps in this set apply to their data palettes.
 */
export function ColourControls({ style, onStyle }: ColourControlsProps) {
  const set = (patch: Partial<Style>) => onStyle((current) => ({ ...current, ...patch }))

  const chosen = (paint: Paint, ground: Paint) =>
    style.paint.type === 'solid' &&
    style.background.type === 'solid' &&
    paint.type === 'solid' &&
    ground.type === 'solid' &&
    style.paint.color === paint.color &&
    style.background.color === ground.color

  return (
    <>
      <Field>
        <Label as="span" id="palette-label">
          Preset
        </Label>
        <PresetRow role="group" aria-labelledby="palette-label">
          {PALETTES.map((palette) => {
            const paint = solid(palette.dark)
            const ground = solid(palette.light)
            return (
              <Preset
                key={palette.id}
                type="button"
                aria-pressed={chosen(paint, ground)}
                $css={`linear-gradient(135deg, ${palette.dark} 0 50%, ${palette.light} 50% 100%)`}
                onClick={() => set({ paint, background: ground })}
              >
                <span aria-hidden="true" />
                {palette.label}
              </Preset>
            )
          })}
          {GRADIENT_PRESETS.map((preset) => (
            <Preset
              key={preset.id}
              type="button"
              aria-pressed={toCss(style.paint) === toCss(preset.paint)}
              $css={toCss(preset.paint)}
              onClick={() => set({ paint: preset.paint, background: solid('#ffffff') })}
            >
              <span aria-hidden="true" />
              {preset.label}
            </Preset>
          ))}
        </PresetRow>
      </Field>

      <PaintField
        id="paint-code"
        label="Code"
        paint={style.paint}
        onChange={(paint) => set({ paint })}
      />

      <PaintField
        id="paint-ground"
        label="Background"
        paint={style.background}
        onChange={(background) => set({ background })}
      />

      <Pair>
        <Field>
          <Checkbox htmlFor="transparent">
            <input
              id="transparent"
              type="checkbox"
              checked={style.transparent}
              onChange={(event) => set({ transparent: event.target.checked })}
            />
            No background
          </Checkbox>
          <p>SVG and PNG keep the transparency. JPEG cannot, and puts it on white.</p>
        </Field>

        <Field>
          <Label htmlFor="round">Rounded corners</Label>
          <RangeRow>
            <Range
              id="round"
              type="range"
              min={0}
              max={20}
              step={1}
              value={Math.round(style.round * 100)}
              onChange={(event) => set({ round: Number(event.target.value) / 100 })}
            />
            <span>{percent.format(style.round)}</span>
          </RangeRow>
        </Field>
      </Pair>

      <Row>
        <Button
          type="button"
          onClick={() =>
            onStyle((current) => ({
              ...current,
              paint: current.background,
              background: current.paint,
            }))
          }
        >
          <ArrowLeftRight aria-hidden="true" /> Swap the two
        </Button>
      </Row>
    </>
  )
}

/** Pairs that only make sense as gradients, so the presets can offer one at all. */
const GRADIENT_PRESETS: { id: string; label: string; paint: Paint }[] = [
  {
    id: 'dusk',
    label: 'Dusk',
    paint: { type: 'linear', from: '#2b1b6b', to: '#8a1c4f', angle: 45 },
  },
  {
    id: 'pine',
    label: 'Pine',
    paint: { type: 'linear', from: '#0b3d2e', to: '#1d6b4f', angle: 90 },
  },
  { id: 'ember', label: 'Ember', paint: { type: 'radial', from: '#7a1f12', to: '#2b0d08' } },
]
