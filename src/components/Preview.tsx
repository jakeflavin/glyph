import { useEffect, useState } from 'react'
import { Check, Copy, Download, Printer } from 'lucide-react'
import { ECC_RECOVERY, type Ecc, type Matrix } from '@/lib/matrix'
import { toPngBlob, toSvg, type Style } from '@/lib/render'
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
    const timer = setTimeout(() => setNote(''), 2400)
    return () => clearTimeout(timer)
  }, [note])

  const canCopy = typeof ClipboardItem !== 'undefined'

  const onSvg = () => {
    if (!matrix) return
    const blob = new Blob([toSvg(matrix, style)], { type: 'image/svg+xml' })
    saveBlob(blob, filenameFor(label, kind, 'svg'))
    setNote('Saved as SVG.')
    onUse()
  }

  const onPng = async () => {
    if (!matrix) return
    try {
      const blob = await toPngBlob(matrix, style, pngSize)
      saveBlob(blob, filenameFor(label, kind, 'png'))
      setNote(`Saved as PNG, ${integer.format(pngSize)} pixels square.`)
      onUse()
    } catch {
      setNote('The PNG could not be made. The SVG will still work.')
    }
  }

  const onCopy = async () => {
    if (!matrix) return
    try {
      const blob = await toPngBlob(matrix, style, 1024)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setNote('Copied. Paste it anywhere that takes an image.')
      onUse()
    } catch {
      setNote('This browser would not let us copy. Download it instead.')
    }
  }

  return (
    <Panel aria-label="The code">
      <Paper>
        {matrix ? (
          <CodeArt matrix={matrix} style={style} title={`QR code for ${label || kind}`} />
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
        <Button $primary type="button" onClick={onSvg} disabled={!matrix}>
          <Download aria-hidden="true" /> SVG
        </Button>
        <Button type="button" onClick={onPng} disabled={!matrix}>
          <Download aria-hidden="true" /> PNG
        </Button>
        <SizeSelect
          aria-label="PNG size in pixels"
          value={pngSize}
          onChange={(event) => setPngSize(Number(event.target.value))}
        >
          {PNG_SIZES.map((size) => (
            <option key={size} value={size}>
              {integer.format(size)} px
            </option>
          ))}
        </SizeSelect>
        {canCopy && (
          <Button type="button" onClick={onCopy} disabled={!matrix}>
            <Copy aria-hidden="true" /> Copy
          </Button>
        )}
        <Button
          type="button"
          onClick={() => {
            onUse()
            window.print()
          }}
          disabled={!matrix}
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
