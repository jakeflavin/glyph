import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { ACCEPTED_IMAGE_TYPES, readLogoFile } from '@/lib/image'
import type { Style } from '@/lib/render'
import { Button, Field, Input, Label, Range, RangeRow } from './controls.styled'
import { Preview, Row, Warning } from './LogoControls.styled'

/** Built once: constructing a formatter costs far more than using one. */
const percent = new Intl.NumberFormat(undefined, { style: 'percent' })

/** Beyond this the image destroys more modules than even level H can rebuild. */
const MAX_SCALE = 0.3
const MIN_SCALE = 0.12

export interface LogoControlsProps {
  style: Style
  /** Shown as a warning, since a logo without it is a code that may not read. */
  correctionIsHighest: boolean
  onStyle: Dispatch<SetStateAction<Style>>
  onCaption: (caption: string) => void
}

export function LogoControls({
  style,
  correctionIsHighest,
  onStyle,
  onCaption,
}: LogoControlsProps) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    try {
      const src = await readLogoFile(file)
      onStyle((current) => ({ ...current, logo: { src, scale: current.logo?.scale ?? 0.2 } }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That image could not be read.')
    }
  }

  return (
    <>
      <Field>
        <Label as="span" id="logo-label">
          Logo
        </Label>
        <Row aria-labelledby="logo-label">
          {style.logo && <Preview src={style.logo.src} alt="" $light={style.light} />}
          <Button type="button" onClick={() => input.current?.click()}>
            <ImagePlus aria-hidden="true" /> {style.logo ? 'Replace' : 'Add an image'}
          </Button>
          {style.logo && (
            <Button
              type="button"
              $danger
              onClick={() => onStyle((current) => ({ ...current, logo: null }))}
            >
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

      {style.logo && (
        <Field>
          <Label htmlFor="logo-scale">Logo size</Label>
          <RangeRow>
            <Range
              id="logo-scale"
              type="range"
              min={MIN_SCALE * 100}
              max={MAX_SCALE * 100}
              step={1}
              value={Math.round(style.logo.scale * 100)}
              onChange={(event) =>
                onStyle((current) => ({
                  ...current,
                  logo: current.logo && {
                    ...current.logo,
                    scale: Number(event.target.value) / 100,
                  },
                }))
              }
            />
            <span>{percent.format(style.logo.scale)}</span>
          </RangeRow>
          {!correctionIsHighest && (
            <Warning role="status">
              Set error correction to H before you print this one. Below that, a logo this size can
              take out more of the code than it can rebuild.
            </Warning>
          )}
        </Field>
      )}

      <Field>
        <Label htmlFor="caption">Caption</Label>
        <Input
          id="caption"
          type="text"
          value={style.caption}
          maxLength={28}
          placeholder="Scan for the menu"
          onChange={(event) => onCaption(event.target.value)}
        />
        <p>Printed under the code, in the downloaded file as well as here.</p>
      </Field>
    </>
  )
}
