import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KindTabs } from './KindTabs'

describe('KindTabs', () => {
  it('marks the chosen tab as selected', () => {
    render(<KindTabs kind="wifi" onSelect={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Wi-Fi', selected: true })).toBeInTheDocument()
  })

  it('moves along with the arrow keys, and wraps at the ends', async () => {
    const onSelect = vi.fn()
    render(<KindTabs kind="link" onSelect={onSelect} />)
    const first = screen.getByRole('tab', { name: 'Link' })
    first.focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenLastCalledWith('text')

    await userEvent.keyboard('{ArrowLeft}')
    expect(onSelect).toHaveBeenLastCalledWith('phone')

    await userEvent.keyboard('{End}')
    expect(onSelect).toHaveBeenLastCalledWith('phone')
  })

  it('keeps only the selected tab in the tab order', () => {
    render(<KindTabs kind="text" onSelect={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Text' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Link' })).toHaveAttribute('tabindex', '-1')
  })
})
