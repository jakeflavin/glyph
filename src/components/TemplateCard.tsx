import { useState } from 'react'
import { Bookmark, X } from 'lucide-react'
import { saveTemplate, type Template } from '@/lib/templates'
import { toCss } from '@/lib/paint'
import type { Style } from '@/lib/render'
import { Card } from './Card'
import { Button, Input } from './controls.styled'
import { Chip, ChipRow, Empty, Forget, Row } from './TemplateCard.styled'

export interface TemplateCardProps {
  templates: Template[]
  style: Style
  onSave: (templates: Template[]) => void
  onApply: (style: Style) => void
  onRemove: (id: string) => void
}

/**
 * A style, kept under a name.
 *
 * Somebody making codes for one business makes them in one look, and re-picking six
 * controls every time is the part that gets abandoned. This is the paid tools' "brand
 * kit", except it is a row of chips in localStorage.
 */
export function TemplateCard({ templates, style, onSave, onApply, onRemove }: TemplateCardProps) {
  const [name, setName] = useState('')

  const onSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(saveTemplate(templates, { id: crypto.randomUUID(), name: trimmed, style }))
    setName('')
  }

  return (
    <Card title="Saved looks">
      <Row>
        <Input
          type="text"
          value={name}
          maxLength={24}
          aria-label="Name for this look"
          placeholder="Bramble Cafe"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onSubmit()
            }
          }}
        />
        <Button type="button" disabled={!name.trim()} onClick={onSubmit}>
          <Bookmark aria-hidden="true" /> Save this one
        </Button>
      </Row>

      {templates.length === 0 ? (
        <Empty>
          Everything above — the colours, the shapes, the logo, the frame — kept under a name and
          one click away next time.
        </Empty>
      ) : (
        <ChipRow>
          {templates.map((template) => (
            <Chip key={template.id} $css={toCss(template.style.paint)}>
              <button type="button" onClick={() => onApply(template.style)}>
                <span aria-hidden="true" />
                {template.name}
              </button>
              <Forget
                type="button"
                aria-label={`Forget ${template.name}`}
                onClick={() => onRemove(template.id)}
              >
                <X aria-hidden="true" />
              </Forget>
            </Chip>
          ))}
        </ChipRow>
      )}
    </Card>
  )
}
