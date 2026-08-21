import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from './Card'

describe('Card', () => {
  it('is a plain surface unless it is told to fold', () => {
    const { container } = render(
      <Card title="Colour">
        <p>inside</p>
      </Card>,
    )
    expect(container.querySelector('details')).toBeNull()
    expect(screen.getByText('inside')).toBeVisible()
  })

  describe('when it folds', () => {
    it('starts as it was told to, and opens on a click', async () => {
      render(
        <Card title="Recent" foldable>
          <p>inside</p>
        </Card>,
      )
      const details = screen.getByRole('group', { name: 'Recent' })
      expect(details).not.toHaveAttribute('open')

      await userEvent.click(screen.getByText('Recent'))
      expect(details).toHaveAttribute('open')
    })

    /*
     * The bug this pins: `defaultOpen` was passed straight to the element, so a card whose
     * caller derived it from its own contents shut itself the moment those contents went —
     * and clearing a list folded away the very panel that would have said it was empty.
     */
    it('stays open when the reason it was opened goes away', () => {
      const { rerender } = render(
        <Card title="Recent" foldable defaultOpen>
          <p>one entry</p>
        </Card>,
      )
      expect(screen.getByRole('group', { name: 'Recent' })).toHaveAttribute('open')

      rerender(
        <Card title="Recent" foldable defaultOpen={false}>
          <p>nothing kept</p>
        </Card>,
      )
      expect(screen.getByRole('group', { name: 'Recent' })).toHaveAttribute('open')
      expect(screen.getByText('nothing kept')).toBeInTheDocument()
    })

    it('stays shut when the reader shut it', async () => {
      const { rerender } = render(
        <Card title="Recent" foldable defaultOpen>
          <p>one entry</p>
        </Card>,
      )
      await userEvent.click(screen.getByText('Recent'))
      expect(screen.getByRole('group', { name: 'Recent' })).not.toHaveAttribute('open')

      rerender(
        <Card title="Recent" foldable defaultOpen>
          <p>two entries</p>
        </Card>,
      )
      expect(screen.getByRole('group', { name: 'Recent' })).not.toHaveAttribute('open')
    })
  })
})
