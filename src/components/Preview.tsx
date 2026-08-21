import { useEffect, useState } from 'react'
import { ClipboardCopy, Copy, Download, Printer } from 'lucide-react'
import { ECC_RECOVERY, type Ecc, type Matrix } from '@/lib/matrix'
import { planDrawing, type Style } from '@/lib/render'
import { toSvg } from '@/lib/emit-svg'
import { toRasterBlob, type RasterFormat } from '@/lib/emit-raster'
import { toEps, toPdf, vectorLoses } from '@/lib/emit-vector'
import { measureCaption } from '@/lib/text'
import { filenameFor, saveBlob } from '@/lib/download'
import type { ScanResult } from '@/lib/scanCheck'
import { Button } from './controls.styled'
import { CodeArt } from './CodeArt'
import { Verdict } from './Verdict'
import {
  Actions,
  Meta,
  Note,
  Panel,
  Paper,
  Payload,
  Placeholder,
  Quiet,
  Select,
  Status,
} from './Preview.styled'

/** Built once: constructing a formatter costs far more than using one. */
const percent = new Intl.NumberFormat(undefined, { style: 'percent' })
const integer = new Intl.NumberFormat()

const PIXEL_WIDTHS: [number, ...number[]] = [512, 1024, 2048, 4096]

type Format = 'svg' | 'png' | 'jpeg' | 'webp' | 'pdf' | 'eps'

const RASTER: Partial<Record<Format, RasterFormat>> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

/** What each format is for, said once, where the choice is made. */
const ABOUT: Record<Format, string> = {
  svg: 'Vector. Sharp at any size, and the one to send a printer.',
  png: 'The everyday image. Keeps a transparent background.',
  jpeg: 'Smaller, and no transparency. Only where something insists on it.',
  webp: 'Smaller than PNG, and not every old tool opens it.',
  pdf: 'Vector, 80 mm wide.',
  eps: 'Vector, 80 mm wide, for older print workflows.',
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
  check: ScanResult | null
  checking: boolean
  /** Called when a code actually leaves the app, which is when it earns a history row. */
  onUse: () => void
}

export function Preview({
  matrix,
  style,
  ecc,
  payload,
  label,
  kind,
  error,
  check,
  checking,
  onUse,
}: PreviewProps) {
  const [format, setFormat] = useState<Format>('svg')
  const [pixels, setPixels] = useState<number>(1024)
  const [note, setNote] = useState('')

  // The confirmation is a transient message, not state the rest of the app reads.
  useEffect(() => {
    if (!note) return
    const timer = setTimeout(() => setNote(''), 3200)
    return () => clearTimeout(timer)
  }, [note])

  const drawing = matrix ? planDrawing(matrix, style) : null
  const canCopy = typeof ClipboardItem !== 'undefined'
  const losses = drawing ? vectorLoses(drawing) : { pdf: [], eps: [] }
  const isRaster = format in RASTER

  const onDownload = async () => {
    if (!drawing) return
    try {
      const blob = await blobFor(format, drawing, pixels)
      saveBlob(blob, filenameFor(label, kind, format))
      setNote(savedNote(format, pixels, format === 'eps' ? losses.eps : losses.pdf))
      onUse()
    } catch {
      setNote('That format could not be made here. SVG always works.')
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
          Version {matrix.version} &middot; {matrix.size} &times; {matrix.size} &middot;{' '}
          {percent.format(ECC_RECOVERY[ecc])} recovery
        </Meta>
      )}

      {matrix && <Verdict style={style} check={check} checking={checking} />}

      <Actions>
        <Select
          aria-label="File format"
          value={format}
          onChange={(event) => setFormat(event.target.value as Format)}
        >
          <optgroup label="Vector">
            <option value="svg">SVG</option>
            <option value="pdf">PDF</option>
            <option value="eps">EPS</option>
          </optgroup>
          <optgroup label="Image">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
          </optgroup>
        </Select>

        {isRaster && (
          <Select
            aria-label="Width in pixels"
            value={pixels}
            onChange={(event) => setPixels(Number(event.target.value))}
          >
            {PIXEL_WIDTHS.map((width) => (
              <option key={width} value={width}>
                {integer.format(width)} px
              </option>
            ))}
          </Select>
        )}

        <Button $primary type="button" onClick={() => void onDownload()} disabled={!drawing}>
          <Download aria-hidden="true" /> Download
        </Button>
      </Actions>

      <Quiet>
        {canCopy && (
          <button type="button" onClick={() => void onCopyImage()} disabled={!drawing}>
            <Copy aria-hidden="true" /> Copy image
          </button>
        )}
        <button type="button" onClick={() => void onCopyMarkup()} disabled={!drawing}>
          <ClipboardCopy aria-hidden="true" /> Copy SVG
        </button>
        <button
          type="button"
          disabled={!drawing}
          onClick={() => {
            onUse()
            window.print()
          }}
        >
          <Printer aria-hidden="true" /> Print
        </button>
      </Quiet>

      <Note role="status">
        {note || aboutFormat(format, losses[format === 'eps' ? 'eps' : 'pdf'])}
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
  if (format === 'svg') return new Blob([toSvg(drawing)], { type: 'image/svg+xml' })
  if (format === 'pdf') return toPdf(drawing, measureCaption(drawing))
  if (format === 'eps') return toEps(drawing)

  const raster = RASTER[format]
  if (!raster) throw new Error('Unknown format')
  return toRasterBlob(drawing, pixels, raster)
}

/** The idle line under the buttons: what this format is, and what it will drop. */
function aboutFormat(format: Format, losses: string[]): string {
  const about = ABOUT[format]
  if ((format === 'pdf' || format === 'eps') && losses.length > 0) {
    return `${about} Leaves out ${losses.join(' and ')}.`
  }
  return about
}

function savedNote(format: Format, pixels: number, losses: string[]): string {
  if (format === 'pdf' || format === 'eps') {
    const kept = `Saved as ${format.toUpperCase()}, 80 mm wide and vector.`
    return losses.length ? `${kept} It leaves out ${losses.join(' and ')}.` : kept
  }
  if (format === 'svg') return 'Saved as SVG. It stays sharp at any size.'
  return `Saved as ${format.toUpperCase()}, ${integer.format(pixels)} pixels across.`
}
