import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionTabs, type Section } from './SectionTabs'

const SECTIONS: [Section, ...Section[]] = [
  { id: 'colour', label: 'Colour' },
  { id: 'shape', label: 'Shape' },
  { id: 'logo', label: 'Logo' },
]

describe('SectionTabs', () => {
  it('marks the chosen tab as selected, and points it at its panel', () => {
    render(
      <SectionTabs sections={SECTIONS} current="shape" label="What to change" onSelect={vi.fn()} />,
    )
    const tab = screen.getByRole('tab', { name: 'Shape', selected: true })
    expect(tab).toHaveAttribute('aria-controls', 'panel-shape')
  })

  it('moves along with the arrow keys, and wraps at the ends', async () => {
    const onSelect = vi.fn()
    render(
      <SectionTabs
        sections={SECTIONS}
        current="colour"
        label="What to change"
        onSelect={onSelect}
      />,
    )
    screen.getByRole('tab', { name: 'Colour' }).focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenLastCalledWith('shape')

    await userEvent.keyboard('{ArrowLeft}')
    expect(onSelect).toHaveBeenLastCalledWith('logo')

    await userEvent.keyboard('{End}')
    expect(onSelect).toHaveBeenLastCalledWith('logo')

    await userEvent.keyboard('{Home}')
    expect(onSelect).toHaveBeenLastCalledWith('colour')
  })

  it('keeps only the selected tab in the tab order', () => {
    render(
      <SectionTabs sections={SECTIONS} current="logo" label="What to change" onSelect={vi.fn()} />,
    )
    expect(screen.getByRole('tab', { name: 'Logo' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Colour' })).toHaveAttribute('tabindex', '-1')
  })
})
