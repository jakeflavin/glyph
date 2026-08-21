import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { ACCEPTED_IMAGE_TYPES, readLogoFile } from '@/lib/image'
import { BUILT_IN_ICONS, iconDataUrl } from '@/lib/icons'
import { flatten } from '@/lib/paint'
import type { Logo, Style } from '@/lib/render'
import { Button, Checkbox, Field, Label, Pair, Range, RangeRow } from './controls.styled'
import { IconTile, IconRow, Preview, Row, Warning } from './LogoControls.styled'

/** Built once: constructing a formatter costs far more than using one. */
const percent = new Intl.NumberFormat(undefined, { style: 'percent' })

/** Beyond this the image destroys more modules than even level H can rebuild. */
const MAX_SCALE = 0.3
const MIN_SCALE = 0.12

const EMPTY_LOGO: Omit<Logo, 'src'> = {
  scale: 0.2,
  margin: 0.5,
  knockout: true,
  round: false,
}

export interface LogoControlsProps {
  style: Style
  /** Shown as a warning, since a logo without it is a code that may not read. */
  correctionIsHighest: boolean
  onStyle: Dispatch<SetStateAction<Style>>
}

export function LogoControls({ style, correctionIsHighest, onStyle }: LogoControlsProps) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const setLogo = (src: string) =>
    onStyle((current) => ({
      ...current,
      logo: { ...EMPTY_LOGO, ...current.logo, src },
    }))

  const patchLogo = (patch: Partial<Logo>) =>
    onStyle((current) => ({
      ...current,
      logo: current.logo ? { ...current.logo, ...patch } : null,
    }))

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    try {
      setLogo(await readLogoFile(file))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That image could not be read.')
    }
  }

  return (
    <>
      <Field>
        <Label as="span" id="logo-label">
          Your own image
        </Label>
        <Row aria-labelledby="logo-label">
          {style.logo && (
            <Preview src={style.logo.src} alt="" $ground={flatten(style.background)} />
          )}
          <Button type="button" onClick={() => input.current?.click()}>
            <ImagePlus aria-hidden="true" /> {style.logo ? 'Replace' : 'Upload an image'}
          </Button>
          {style.logo && (
            <Button type="button" $danger onClick={() => onStyle((c) => ({ ...c, logo: null }))}>
              <Trash2 aria-hidden="true" /> Remove
            </Button>
          )}
          <input
            ref={input}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            hidden
            onChange={(event) => {
              void onFile(event.target.files?.[0])
              // Cleared so choosing the same file twice in a row still fires a change.
              event.target.value = ''
            }}
          />
        </Row>
        {error ? (
          <Warning role="alert">{error}</Warning>
        ) : (
          <p>
            The image is resized and kept on this device. It is drawn over the code, so the modules
            underneath it are lost and the correction level rebuilds them.
          </p>
        )}
      </Field>

      <Field>
        <Label as="span" id="icon-label">
          Or a mark
        </Label>
        <IconRow role="group" aria-labelledby="icon-label">
          {BUILT_IN_ICONS.map((icon) => {
            const src = iconDataUrl(icon, flatten(style.paint), flatten(style.background))
            return (
              <IconTile
                key={icon.id}
                type="button"
                aria-label={icon.label}
                title={icon.label}
                aria-pressed={style.logo?.src === src}
                onClick={() => setLogo(src)}
              >
                <img src={src} alt="" />
              </IconTile>
            )
          })}
        </IconRow>
        <p>
          Drawn in the code&rsquo;s own colours, so it stays part of the thing rather than on top of
          it.
        </p>
      </Field>

      {style.logo && (
        <>
          <Pair>
            <Field>
              <Label htmlFor="logo-scale">Size</Label>
              <RangeRow>
                <Range
                  id="logo-scale"
                  type="range"
                  min={MIN_SCALE * 100}
                  max={MAX_SCALE * 100}
                  step={1}
                  value={Math.round(style.logo.scale * 100)}
                  onChange={(event) => patchLogo({ scale: Number(event.target.value) / 100 })}
                />
                <span>{percent.format(style.logo.scale)}</span>
              </RangeRow>
            </Field>

            <Field>
              <Label htmlFor="logo-margin">Clearance</Label>
              <RangeRow>
                <Range
                  id="logo-margin"
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={Math.round(style.logo.margin * 2)}
                  onChange={(event) => patchLogo({ margin: Number(event.target.value) / 2 })}
                />
                <span>{style.logo.margin}</span>
              </RangeRow>
            </Field>
          </Pair>

          <Pair>
            <Field>
              <Checkbox htmlFor="logo-knockout">
                <input
                  id="logo-knockout"
                  type="checkbox"
                  checked={style.logo.knockout}
                  onChange={(event) => patchLogo({ knockout: event.target.checked })}
                />
                Clear the code behind it
              </Checkbox>
              <p>Off puts the image straight on the modules. It reads less well.</p>
            </Field>

            <Field>
              <Checkbox htmlFor="logo-round">
                <input
                  id="logo-round"
                  type="checkbox"
                  checked={style.logo.round}
                  onChange={(event) => patchLogo({ round: event.target.checked })}
                />
                Crop it to a circle
              </Checkbox>
            </Field>
          </Pair>

          {!correctionIsHighest && (
            <Warning role="status">
              Set error correction to H before you print this one. Below that, a logo this size can
              take out more of the code than it can rebuild.
            </Warning>
          )}
        </>
      )}
    </>
  )
}
