import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KINDS } from '@/lib/payloads'
import { KindTabs } from './KindTabs'

/** Asserted against the table rather than a literal, so adding a kind cannot break this. */
const LAST = KINDS[KINDS.length - 1]?.id

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

    // The list wraps, so left from the first tab lands on the last one.
    await userEvent.keyboard('{ArrowLeft}')
    expect(onSelect).toHaveBeenLastCalledWith(LAST)

    await userEvent.keyboard('{End}')
    expect(onSelect).toHaveBeenLastCalledWith(LAST)
  })

  it('keeps only the selected tab in the tab order', () => {
    render(<KindTabs kind="text" onSelect={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Text' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Link' })).toHaveAttribute('tabindex', '-1')
  })
})
