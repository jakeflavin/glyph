import { useState } from 'react'
import { FileArchive } from 'lucide-react'
import { BULK_LIMIT, parseBulk } from '@/lib/bulk'
import { buildMatrix, type Ecc } from '@/lib/matrix'
import { planDrawing, type Style } from '@/lib/render'
import { toSvg } from '@/lib/emit-svg'
import { toRasterBlob } from '@/lib/emit-raster'
import { toZip } from '@/lib/zip'
import { filenameFor, saveBlob } from '@/lib/download'
import { Card } from './Card'
import { Button, Checkbox, Field, Label, Segmented, Textarea } from './controls.styled'
import { Row, Status } from './BulkCard.styled'

/** Built once: constructing a formatter costs far more than using one. */
const integer = new Intl.NumberFormat()

export interface BulkCardProps {
  style: Style
  ecc: Ecc
}

/**
 * A list in, a zip of codes out.
 *
 * This is the feature the paid tools put behind the account, and it is the one a person
 * with forty tables or three hundred assets actually needs. It runs here, in the tab, on
 * the same renderer as the single code — so every one of them carries the style already
 * set up above, and none of them touch a server.
 */
export function BulkCard({ style, ecc }: BulkCardProps) {
  const [input, setInput] = useState('')
  const [format, setFormat] = useState<'png' | 'svg'>('png')
  const [asLinks, setAsLinks] = useState(true)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  const items = parseBulk(input, asLinks)
  const tooMany = items.length > BULK_LIMIT

  const onMake = async () => {
    if (items.length === 0 || tooMany) return
    setBusy(true)
    setNote('')

    try {
      const files: { name: string; blob: Blob }[] = []
      const used = new Set<string>()

      for (const item of items.slice(0, BULK_LIMIT)) {
        const { matrix } = buildMatrix(item.value, ecc)
        if (!matrix) continue

        const drawing = planDrawing(matrix, style)
        const blob =
          format === 'svg'
            ? new Blob([toSvg(drawing)], { type: 'image/svg+xml' })
            : await toRasterBlob(drawing, 1024, 'image/png')

        // Two rows that name themselves the same thing would overwrite each other.
        let name = filenameFor(item.label, 'code', format)
        let attempt = 2
        while (used.has(name)) {
          name = filenameFor(`${item.label} ${attempt}`, 'code', format)
          attempt += 1
        }
        used.add(name)
        files.push({ name, blob })
      }

      if (files.length === 0) {
        setNote('None of those lines could be made into a code.')
        return
      }

      saveBlob(await toZip(files), `qr-codes-${files.length}.zip`)
      setNote(`Saved ${integer.format(files.length)} codes in one zip.`)
    } catch {
      setNote('The zip could not be made here.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card
      title="Make many at once"
      note={items.length ? `${integer.format(items.length)} lines` : undefined}
      foldable
    >
      <Field>
        <Label htmlFor="bulk">One code per line</Label>
        <Textarea
          id="bulk"
          rows={4}
          value={input}
          placeholder={'example.com/table/1, Table 1\nexample.com/table/2, Table 2'}
          onChange={(event) => setInput(event.target.value)}
        />
        <p>
          Add a comma and a name to say what the file should be called. Everything uses the style
          set above, and the whole lot comes back as one zip.
        </p>
      </Field>

      <Row>
        <Segmented role="group" aria-label="File type">
          {(['png', 'svg'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={format === option}
              onClick={() => setFormat(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </Segmented>

        <Checkbox htmlFor="bulk-links">
          <input
            id="bulk-links"
            type="checkbox"
            checked={asLinks}
            onChange={(event) => setAsLinks(event.target.checked)}
          />
          Treat lines as links
        </Checkbox>

        <Button
          $primary
          type="button"
          disabled={busy || items.length === 0 || tooMany}
          onClick={() => void onMake()}
        >
          <FileArchive aria-hidden="true" />
          {busy ? 'Drawing them…' : 'Download the zip'}
        </Button>
      </Row>

      {tooMany && (
        <Status $bad role="alert">
          That is more than {integer.format(BULK_LIMIT)} lines. Split it into a few runs, or the tab
          will lock up while it draws them.
        </Status>
      )}
      {note && !tooMany && <Status role="status">{note}</Status>}
    </Card>
  )
}
