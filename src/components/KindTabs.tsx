import { useRef } from 'react'
import { KINDS, type KindId } from '@/lib/payloads'
import { Tab, TabRow } from './KindTabs.styled'

export interface KindTabsProps {
  kind: KindId
  onSelect: (kind: KindId) => void
}

/**
 * A real tab list, which means the arrow keys move between the tabs and only the selected
 * one is in the tab order. Rendering seven buttons and calling them tabs without that is
 * a promise to a screen reader that the widget does not keep.
 */
export function KindTabs({ kind, onSelect }: KindTabsProps) {
  const row = useRef<HTMLDivElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const index = KINDS.findIndex((entry) => entry.id === kind)
    const last = KINDS.length - 1
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % KINDS.length
        : event.key === 'ArrowLeft'
          ? (index + last) % KINDS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1
    if (next < 0) return

    event.preventDefault()
    const entry = KINDS[next]
    if (!entry) return
    onSelect(entry.id)
    row.current?.querySelector<HTMLButtonElement>(`#tab-${entry.id}`)?.focus()
  }

  return (
    <TabRow ref={row} role="tablist" aria-label="What the code is for" onKeyDown={handleKeyDown}>
      {KINDS.map((entry) => (
        <Tab
          key={entry.id}
          type="button"
          role="tab"
          id={`tab-${entry.id}`}
          aria-selected={entry.id === kind}
          aria-controls="code-form"
          tabIndex={entry.id === kind ? 0 : -1}
          $active={entry.id === kind}
          onClick={() => onSelect(entry.id)}
        >
          {entry.label}
        </Tab>
      ))}
    </TabRow>
  )
}
