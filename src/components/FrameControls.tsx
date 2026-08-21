import type { Dispatch, SetStateAction } from 'react'
import type { FrameStyle, Style } from '@/lib/render'
import { Field, Input, Label, Pair, Segmented } from './controls.styled'
import { Sample, SampleRow } from './FrameControls.styled'

const FRAMES: [{ id: FrameStyle; label: string }, ...{ id: FrameStyle; label: string }[]] = [
  { id: 'none', label: 'None' },
  { id: 'line', label: 'Outline' },
  { id: 'bar', label: 'Bar' },
  { id: 'card', label: 'Card' },
]

export interface FrameControlsProps {
  style: Style
  onStyle: Dispatch<SetStateAction<Style>>
}

/**
 * The frame, and the line of text in it.
 *
 * A code with no instruction on it gets scanned less: the reason every printed one says
 * "scan me" is that people need telling what it is for. It is drawn into the file rather
 * than left for whoever lays out the poster, because most of the time nobody does.
 */
export function FrameControls({ style, onStyle }: FrameControlsProps) {
  const setFrame = (patch: Partial<Style['frame']>) =>
    onStyle((current) => ({ ...current, frame: { ...current.frame, ...patch } }))

  return (
    <>
      <Field>
        <Label as="span" id="frame-label">
          Frame
        </Label>
        <SampleRow role="group" aria-labelledby="frame-label">
          {FRAMES.map((frame) => (
            <Sample
              key={frame.id}
              type="button"
              aria-pressed={frame.id === style.frame.style}
              onClick={() => setFrame({ style: frame.id })}
            >
              <svg viewBox="0 0 20 24" aria-hidden="true">
                {frame.id === 'card' && <rect x="0" y="0" width="20" height="24" rx="3" />}
                {frame.id === 'line' && (
                  <path fillRule="evenodd" d="M0 0h20v24h-20zM1.4 1.4h17.2v21.2h-17.2z" />
                )}
                {(frame.id === 'bar' || frame.id === 'card') && (
                  <rect x="0" y="18" width="20" height="6" rx={frame.id === 'card' ? 3 : 0} />
                )}
                <rect className="code" x="4" y="4" width="12" height="12" />
              </svg>
              {frame.label}
            </Sample>
          ))}
        </SampleRow>
      </Field>

      <Pair>
        <Field>
          <Label htmlFor="caption">Caption</Label>
          <Input
            id="caption"
            type="text"
            value={style.frame.caption}
            maxLength={28}
            placeholder="Scan for the menu"
            onChange={(event) => setFrame({ caption: event.target.value })}
          />
          <p>Printed with the code, in the downloaded file as well as here.</p>
        </Field>

        <Field>
          <Label as="span" id="caption-side-label">
            Caption goes
          </Label>
          <Segmented role="group" aria-labelledby="caption-side-label">
            {(['below', 'above'] as const).map((position) => (
              <button
                key={position}
                type="button"
                aria-pressed={style.frame.position === position}
                onClick={() => setFrame({ position })}
              >
                {position === 'below' ? 'Below' : 'Above'}
              </button>
            ))}
          </Segmented>
        </Field>
      </Pair>
    </>
  )
}
