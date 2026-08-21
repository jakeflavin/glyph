import { useState, type Dispatch, type SetStateAction } from 'react'
import { Bookmark, RotateCcw, X } from 'lucide-react'
import { toCss } from '@/lib/paint'
import type { Ecc } from '@/lib/matrix'
import type { Style } from '@/lib/render'
import { saveTemplate, type Template } from '@/lib/templates'
import { DEFAULT_STYLE } from '@/lib/settings'
import { Card } from './Card'
import { SectionTabs, type Section } from './SectionTabs'
import { ColourControls } from './ColourControls'
import { ShapeControls } from './ShapeControls'
import { LogoControls } from './LogoControls'
import { FrameControls } from './FrameControls'
import { ScanControls } from './ScanControls'
import { Button, Input } from './controls.styled'
import { Chip, ChipRow, Looks, Panel, Reset, SaveRow } from './DesignCard.styled'

const SECTIONS: [Section, ...Section[]] = [
  { id: 'colour', label: 'Colour' },
  { id: 'shape', label: 'Shape' },
  { id: 'logo', label: 'Logo' },
  { id: 'frame', label: 'Frame' },
  { id: 'scanning', label: 'Scanning' },
]

export interface DesignCardProps {
  style: Style
  ecc: Ecc
  templates: Template[]
  onStyle: Dispatch<SetStateAction<Style>>
  onEcc: (ecc: Ecc) => void
  onTemplates: Dispatch<SetStateAction<Template[]>>
}

/**
 * Everything about how the code looks, in one card.
 *
 * These were five cards, and all of them were open at once: forty controls down one
 * column, of which a person uses two. They are the same five groups, one at a time, and
 * the saved looks sit at the bottom because that is where the thing they save is made.
 */
export function DesignCard({
  style,
  ecc,
  templates,
  onStyle,
  onEcc,
  onTemplates,
}: DesignCardProps) {
  const [section, setSection] = useState('colour')
  const [name, setName] = useState('')

  // Forty controls deep, "put it back" is the one thing that cannot be done by hand.
  const styled = JSON.stringify(style) !== JSON.stringify(DEFAULT_STYLE)

  const onSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onTemplates((current) =>
      saveTemplate(current, { id: crypto.randomUUID(), name: trimmed, style }),
    )
    setName('')
  }

  return (
    <Card
      title="Design"
      action={
        styled ? (
          <Reset type="button" onClick={() => onStyle(DEFAULT_STYLE)}>
            <RotateCcw aria-hidden="true" /> Reset
          </Reset>
        ) : undefined
      }
    >
      <SectionTabs
        sections={SECTIONS}
        current={section}
        label="What to change"
        onSelect={setSection}
      />

      <Panel id={`panel-${section}`} role="tabpanel" aria-labelledby={`tab-${section}`}>
        {section === 'colour' && <ColourControls style={style} onStyle={onStyle} />}
        {section === 'shape' && <ShapeControls style={style} onStyle={onStyle} />}
        {section === 'logo' && (
          <LogoControls style={style} correctionIsHighest={ecc === 'H'} onStyle={onStyle} />
        )}
        {section === 'frame' && <FrameControls style={style} onStyle={onStyle} />}
        {section === 'scanning' && (
          <ScanControls ecc={ecc} style={style} onEcc={onEcc} onStyle={onStyle} />
        )}
      </Panel>

      <Looks>
        <SaveRow>
          <Input
            type="text"
            value={name}
            maxLength={24}
            aria-label="Name for this look"
            placeholder="Save this look as…"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSave()
              }
            }}
          />
          <Button type="button" disabled={!name.trim()} onClick={onSave}>
            <Bookmark aria-hidden="true" /> Save
          </Button>
        </SaveRow>

        {templates.length > 0 && (
          <ChipRow>
            {templates.map((template) => (
              <Chip key={template.id} $css={toCss(template.style.paint)}>
                <button type="button" onClick={() => onStyle(template.style)}>
                  <span aria-hidden="true" />
                  {template.name}
                </button>
                <button
                  type="button"
                  className="forget"
                  aria-label={`Forget ${template.name}`}
                  onClick={() =>
                    onTemplates((current) => current.filter((entry) => entry.id !== template.id))
                  }
                >
                  <X aria-hidden="true" />
                </button>
              </Chip>
            ))}
          </ChipRow>
        )}
      </Looks>
    </Card>
  )
}
