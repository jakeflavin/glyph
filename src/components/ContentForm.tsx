import { FIELDS, type FieldSpec } from '@/lib/fields'
import type { KindId } from '@/lib/payloads'
import { Checkbox, Input, Label, Select, Textarea } from './controls.styled'
import { Cell, Grid } from './ContentForm.styled'

export interface ContentFormProps {
  kind: KindId
  values: Record<string, string | boolean>
  onChange: (name: string, value: string | boolean) => void
}

/**
 * Every kind's form, rendered from one table.
 *
 * The fields differ; the layout, the labels and the touch sizing do not, so there is one
 * renderer rather than seven near-identical forms.
 */
export function ContentForm({ kind, values, onChange }: ContentFormProps) {
  return (
    <Grid>
      {FIELDS[kind].map((field) => (
        <Cell key={field.name} $wide={field.wide ?? false}>
          {renderField(kind, field, values[field.name], onChange)}
        </Cell>
      ))}
    </Grid>
  )
}

function renderField(
  kind: KindId,
  field: FieldSpec,
  value: string | boolean | undefined,
  onChange: (name: string, value: string | boolean) => void,
) {
  const id = `${kind}-${field.name}`

  if (field.type === 'checkbox') {
    return (
      <Checkbox htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(field.name, event.target.checked)}
        />
        {field.label}
      </Checkbox>
    )
  }

  const text = typeof value === 'string' ? value : ''

  return (
    <>
      <Label htmlFor={id}>{field.label}</Label>
      {field.type === 'textarea' ? (
        <Textarea
          id={id}
          value={text}
          rows={3}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      ) : field.type === 'select' ? (
        <Select id={id} value={text} onChange={(event) => onChange(field.name, event.target.value)}>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : field.type === 'datetime' ? (
        <Input
          id={id}
          type="datetime-local"
          value={text}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      ) : (
        <Input
          id={id}
          type="text"
          value={text}
          placeholder={field.placeholder}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      )}
    </>
  )
}
