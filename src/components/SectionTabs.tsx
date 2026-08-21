import { useRef } from 'react'
import { Tab, TabRow } from './SectionTabs.styled'

export interface Section {
  id: string
  label: string
}

export interface SectionTabsProps {
  sections: [Section, ...Section[]]
  current: string
  label: string
  onSelect: (id: string) => void
}

/**
 * A tab strip for a card that holds several panels.
 *
 * A real tab list, which means the arrow keys move between the tabs and only the selected
 * one is in the tab order. Rendering buttons and calling them tabs without that is a
 * promise to a screen reader that the widget does not keep.
 */
export function SectionTabs({ sections, current, label, onSelect }: SectionTabsProps) {
  const row = useRef<HTMLDivElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const index = sections.findIndex((section) => section.id === current)
    const last = sections.length - 1
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % sections.length
        : event.key === 'ArrowLeft'
          ? (index + last) % sections.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1
    if (next < 0) return

    event.preventDefault()
    const section = sections[next]
    if (!section) return
    onSelect(section.id)
    row.current?.querySelector<HTMLButtonElement>(`#tab-${section.id}`)?.focus()
  }

  return (
    <TabRow ref={row} role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
      {sections.map((section) => (
        <Tab
          key={section.id}
          type="button"
          role="tab"
          id={`tab-${section.id}`}
          aria-selected={section.id === current}
          aria-controls={`panel-${section.id}`}
          tabIndex={section.id === current ? 0 : -1}
          $active={section.id === current}
          onClick={() => onSelect(section.id)}
        >
          {section.label}
        </Tab>
      ))}
    </TabRow>
  )
}
