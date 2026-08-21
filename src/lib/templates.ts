import type { Style } from './render'

export interface Template {
  id: string
  name: string
  style: Style
}

/** Enough to keep a few brands side by side without the list becoming a filing cabinet. */
export const TEMPLATE_LIMIT = 12

/** Saving under a name that is already used replaces it, which is what "save" means. */
export function saveTemplate(templates: Template[], entry: Template): Template[] {
  const rest = templates.filter(
    (template) => template.name.toLowerCase() !== entry.name.toLowerCase(),
  )
  return [entry, ...rest].slice(0, TEMPLATE_LIMIT)
}

export function removeTemplate(templates: Template[], id: string): Template[] {
  return templates.filter((template) => template.id !== id)
}
