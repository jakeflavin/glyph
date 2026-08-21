import { useEffect, useState } from 'react'
import { Check, ClipboardCopy, Copy, Download, Printer } from 'lucide-react'
import { ECC_RECOVERY, type Ecc, type Matrix } from '@/lib/matrix'
import { planDrawing, type Style } from '@/lib/render'
import { toSvg } from '@/lib/emit-svg'
import { toRasterBlob, type RasterFormat } from '@/lib/emit-raster'
import { toEps, toPdf, vectorLoses } from '@/lib/emit-vector'
import { measureCaption } from '@/lib/text'
import { filenameFor, saveBlob } from '@/lib/download'
import { Button } from './controls.styled'
import { CodeArt } from './CodeArt'
import {
  Actions,
  Meta,
  Note,
  Panel,
  Paper,
  Payload,
  Placeholder,
  SizeSelect,
  Status,
} from './Preview.styled'

/** Built once: constructing a formatter costs far more than using one. */
const percent = new Intl.NumberFormat(undefined, { style: 'percent' })
const integer = new Intl.NumberFormat()

const PNG_SIZES: [number, ...number[]] = [512, 1024, 2048, 4096]

type Format = 'svg' | 'png' | 'jpeg' | 'webp' | 'pdf' | 'eps'

const RASTER: Partial<Record<Format, RasterFormat>> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

export interface PreviewProps {
  matrix: Matrix | null
  style: Style
  ecc: Ecc
  /** The exact string inside the code, shown so nothing about it is a secret. */
  payload: string
  /** What the code is of, used to name the downloaded file. */
  label: string
  kind: string
  error: string | null
  /** Called when a code actually leaves the app, which is when it earns a history row. */
  onUse: () => void
}

export function Preview({ matrix, style, ecc, payload, label, kind, error, onUse }: PreviewProps) {
  const [pngSize, setPngSize] = useState<number>(1024)
  const [note, setNote] = useState('')

  // The confirmation is a transient message, not state the rest of the app reads.
  useEffect(() => {
    if (!note) return
    const timer = setTimeout(() => setNote(''), 2800)
    return () => clearTimeout(timer)
  }, [note])

  const drawing = matrix ? planDrawing(matrix, style) : null
  const canCopy = typeof ClipboardItem !== 'undefined'
  const losses = drawing ? vectorLoses(drawing) : { pdf: [], eps: [] }

  const download = async (format: Format) => {
    if (!drawing) return
    try {
      const blob = await blobFor(format, drawing, pngSize)
      saveBlob(blob, filenameFor(label, kind, format))
      setNote(noteFor(format, pngSize, losses[format === 'eps' ? 'eps' : 'pdf']))
      onUse()
    } catch {
      setNote('That format could not be made here. The SVG always works.')
    }
  }

  const onCopyImage = async () => {
    if (!drawing) return
    try {
      const blob = await toRasterBlob(drawing, 1024, 'image/png')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setNote('Copied. Paste it anywhere that takes an image.')
      onUse()
    } catch {
      setNote('This browser would not let us copy. Download it instead.')
    }
  }

  const onCopyMarkup = async () => {
    if (!drawing) return
    try {
      await navigator.clipboard.writeText(toSvg(drawing))
      setNote('SVG markup copied. Paste it straight into a page.')
      onUse()
    } catch {
      setNote('This browser would not let us copy.')
    }
  }

  return (
    <Panel aria-label="The code">
      <Paper>
        {drawing ? (
          <CodeArt
            drawing={drawing}
            crisp={style.module === 'square'}
            title={`QR code for ${label || kind}`}
          />
        ) : (
          <Placeholder>
            {error ? 'Nothing to draw yet.' : 'Fill in the form and the code appears here.'}
          </Placeholder>
        )}
      </Paper>

      {error && <Status role="alert">{error}</Status>}

      {matrix && (
        <Meta>
          <div>
            <dt>Version</dt>
            <dd>{matrix.version}</dd>
          </div>
          <div>
            <dt>Modules</dt>
            <dd>
              {matrix.size} &times; {matrix.size}
            </dd>
          </div>
          <div>
            <dt>Recovery</dt>
            <dd>{percent.format(ECC_RECOVERY[ecc])}</dd>
          </div>
        </Meta>
      )}

      <Actions>
        <Button $primary type="button" onClick={() => void download('svg')} disabled={!drawing}>
          <Download aria-hidden="true" /> SVG
        </Button>
        <Button type="button" onClick={() => void download('png')} disabled={!drawing}>
          <Download aria-hidden="true" /> PNG
        </Button>
        <SizeSelect
          aria-label="PNG width in pixels"
          value={pngSize}
          onChange={(event) => setPngSize(Number(event.target.value))}
        >
          {PNG_SIZES.map((size) => (
            <option key={size} value={size}>
              {integer.format(size)} px
            </option>
          ))}
        </SizeSelect>
      </Actions>

      <Actions>
        <Button type="button" onClick={() => void download('pdf')} disabled={!drawing}>
          PDF
        </Button>
        <Button type="button" onClick={() => void download('eps')} disabled={!drawing}>
          EPS
        </Button>
        <Button type="button" onClick={() => void download('jpeg')} disabled={!drawing}>
          JPEG
        </Button>
        <Button type="button" onClick={() => void download('webp')} disabled={!drawing}>
          WEBP
        </Button>
      </Actions>

      <Actions>
        {canCopy && (
          <Button type="button" onClick={() => void onCopyImage()} disabled={!drawing}>
            <Copy aria-hidden="true" /> Copy image
          </Button>
        )}
        <Button type="button" onClick={() => void onCopyMarkup()} disabled={!drawing}>
          <ClipboardCopy aria-hidden="true" /> Copy SVG
        </Button>
        <Button
          type="button"
          onClick={() => {
            onUse()
            window.print()
          }}
          disabled={!drawing}
        >
          <Printer aria-hidden="true" /> Print
        </Button>
      </Actions>

      <Note role="status">
        {note && (
          <>
            <Check aria-hidden="true" size={14} /> {note}
          </>
        )}
      </Note>

      {payload && (
        <Payload>
          <summary>What is inside the code</summary>
          <pre>{payload}</pre>
        </Payload>
      )}
    </Panel>
  )
}

async function blobFor(
  format: Format,
  drawing: ReturnType<typeof planDrawing>,
  pixels: number,
): Promise<Blob> {
  if (format === 'svg') {
    return new Blob([toSvg(drawing)], { type: 'image/svg+xml' })
  }
  if (format === 'pdf') {
    return toPdf(drawing, measureCaption(drawing))
  }
  if (format === 'eps') {
    return toEps(drawing)
  }
  const raster = RASTER[format]
  if (!raster) throw new Error('Unknown format')
  return toRasterBlob(drawing, pixels, raster)
}

function noteFor(format: Format, pixels: number, losses: string[]): string {
  if (format === 'svg') return 'Saved as SVG. It stays sharp at any size.'
  if (format === 'pdf' || format === 'eps') {
    const kept = `Saved as ${format.toUpperCase()}, 80 mm wide and vector.`
    return losses.length ? `${kept} It leaves out ${losses.join(' and ')}.` : kept
  }
  return `Saved as ${format.toUpperCase()}, ${integer.format(pixels)} pixels across.`
}
