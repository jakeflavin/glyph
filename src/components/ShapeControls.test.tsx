import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DEFAULT_STYLE } from '@/lib/settings'
import { ShapeControls } from './ShapeControls'

/*
 * Three rows of shapes share one vocabulary, so the visible words repeat. What must not
 * repeat is the accessible name — read as a list, "Square, Rounded, Circle, Leaf, Square,
 * Rounded…" is a panel nobody can navigate.
 */
describe('ShapeControls', () => {
  it('gives every control a name of its own', () => {
    render(<ShapeControls style={DEFAULT_STYLE} onStyle={vi.fn()} />)

    const names = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.trim())
    expect(new Set(names).size).toBe(names.length)
  })

  it('names each one after the group it belongs to', () => {
    render(<ShapeControls style={DEFAULT_STYLE} onStyle={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Square modules' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Square corner frame' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Square corner centre' })).toBeInTheDocument()
  })

  it('keeps the words on screen inside the name, so voice control still works', () => {
    render(<ShapeControls style={DEFAULT_STYLE} onStyle={vi.fn()} />)

    for (const button of screen.getAllByRole('button')) {
      const visible = button.textContent?.trim() ?? ''
      const name = button.getAttribute('aria-label')
      if (!name || !visible) continue
      expect({ visible, contains: name.includes(visible) }).toEqual({ visible, contains: true })
    }
  })
})
