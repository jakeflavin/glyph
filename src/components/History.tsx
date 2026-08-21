import { X } from 'lucide-react'
import { KINDS, type Draft, type KindId } from '@/lib/payloads'
import type { HistoryEntry } from '@/lib/history'
import { relativeTime } from '@/lib/relativeTime'
import { Card } from './Card'
import { Button } from './controls.styled'
import { ClearRow, Empty, Item, List, Remove, Restore, When } from './History.styled'

export interface HistoryProps {
  entries: HistoryEntry[]
  /** Passed in rather than read here, so a list rendered twice cannot show two clocks. */
  now: number
  onRestore: (kind: KindId, draft: Draft) => void
  onRemove: (id: string) => void
  onClear: () => void
}

const LABELS: Record<KindId, string> = Object.fromEntries(
  KINDS.map((kind) => [kind.id, kind.label]),
) as Record<KindId, string>

/**
 * The codes made on this device, kept on this device.
 *
 * A code is saved when it is downloaded, copied or printed — not while it is being typed,
 * which would fill the list with half-finished versions of the same thing.
 */
export function History({ entries, now, onRestore, onRemove, onClear }: HistoryProps) {
  return (
    <Card
      title="Recent"
      note={entries.length > 0 ? `${entries.length} kept` : undefined}
      foldable
      defaultOpen={entries.length > 0}
    >
      {entries.length === 0 ? (
        <Empty>Codes you download or copy are listed here. They never leave this device.</Empty>
      ) : (
        <List>
          {entries.map((entry) => (
            <Item key={entry.id}>
              <Restore
                type="button"
                aria-label={`Load ${entry.label || LABELS[entry.kind]} back into the form`}
                onClick={() => onRestore(entry.kind, entry.draft)}
              >
                <strong>{entry.label || LABELS[entry.kind]}</strong>
                <span>{LABELS[entry.kind]}</span>
              </Restore>
              <When>{relativeTime(entry.at, now)}</When>
              <Remove
                type="button"
                aria-label={`Forget ${entry.label || LABELS[entry.kind]}`}
                onClick={() => onRemove(entry.id)}
              >
                <X aria-hidden="true" />
              </Remove>
            </Item>
          ))}
        </List>
      )}

      {entries.length > 0 && (
        <ClearRow>
          <Button type="button" onClick={onClear}>
            Clear the list
          </Button>
        </ClearRow>
      )}
    </Card>
  )
}
