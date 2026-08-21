import type { Dispatch, SetStateAction } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { PALETTES } from '@/lib/colors'
import type { Style } from '@/lib/render'
import { Button, Field, Label, Pair } from './controls.styled'
import { Row, Swatch, SwatchRow, Well } from './ColourControls.styled'

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
 * The app itself stays black and white. These are the only hues on the page, and they
 * belong to the thing being made rather than to the chrome around it — the same rule the
 * other apps in this set apply to their data palettes.
 */
export function ColourControls({ style, onStyle }: ColourControlsProps) {
  const eyeFollows = style.eye === null

  return (
    <>
      <Field>
        <Label as="span" id="palette-label">
          Preset
        </Label>
        <SwatchRow role="group" aria-labelledby="palette-label">
          {PALETTES.map((palette) => {
            const chosen = palette.dark === style.dark && palette.light === style.light
            return (
              <Swatch
                key={palette.id}
                type="button"
                aria-pressed={chosen}
                $dark={palette.dark}
                $light={palette.light}
                onClick={() =>
                  onStyle((current) => ({ ...current, dark: palette.dark, light: palette.light }))
                }
              >
                <span aria-hidden="true" />
                {palette.label}
              </Swatch>
            )
          })}
        </SwatchRow>
      </Field>

      <Pair>
        <Field>
          <Label htmlFor="colour-dark">Code</Label>
          <Well>
            <input
              id="colour-dark"
              type="color"
              value={style.dark}
              onChange={(event) => onStyle((current) => ({ ...current, dark: event.target.value }))}
            />
            <output>{style.dark.toUpperCase()}</output>
          </Well>
        </Field>

        <Field>
          <Label htmlFor="colour-light">Background</Label>
          <Well>
            <input
              id="colour-light"
              type="color"
              value={style.light}
              onChange={(event) =>
                onStyle((current) => ({ ...current, light: event.target.value }))
              }
            />
            <output>{style.light.toUpperCase()}</output>
          </Well>
        </Field>
      </Pair>

      <Field>
        <Label htmlFor="colour-eye">Corners</Label>
        <Row>
          <Well>
            <input
              id="colour-eye"
              type="color"
              value={style.eye ?? style.dark}
              disabled={eyeFollows}
              onChange={(event) => onStyle((current) => ({ ...current, eye: event.target.value }))}
            />
            <output>{(style.eye ?? style.dark).toUpperCase()}</output>
          </Well>
          <Button
            type="button"
            aria-pressed={!eyeFollows}
            onClick={() =>
              onStyle((current) => ({ ...current, eye: eyeFollows ? current.dark : null }))
            }
          >
            {eyeFollows ? 'Colour separately' : 'Match the code'}
          </Button>
        </Row>
        <p>The three square patterns are what a scanner finds first. They can differ.</p>
      </Field>

      <Row>
        <Button
          type="button"
          onClick={() =>
            onStyle((current) => ({ ...current, dark: current.light, light: current.dark }))
          }
        >
          <ArrowLeftRight aria-hidden="true" /> Swap the two
        </Button>
      </Row>
    </>
  )
}
