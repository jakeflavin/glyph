import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentForm } from './ContentForm'

const WIFI = { ssid: 'Cafe', password: '', security: 'WPA', hidden: false }

describe('ContentForm', () => {
  it('renders the fields the chosen kind has, and no others', () => {
    render(
      <ContentForm kind="wifi" values={WIFI} hint="Scanning offers to join." onChange={vi.fn()} />,
    )

    expect(screen.getByLabelText('Network name')).toHaveValue('Cafe')
    expect(screen.getByLabelText('Security')).toHaveValue('WPA')
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
    expect(screen.getByText('Scanning offers to join.')).toBeInTheDocument()
  })

  it('reports what was typed, by field name', async () => {
    const onChange = vi.fn()
    render(<ContentForm kind="wifi" values={WIFI} hint="" onChange={onChange} />)

    await userEvent.type(screen.getByLabelText('Password'), 'x')
    expect(onChange).toHaveBeenCalledWith('password', 'x')
  })

  it('reports a checkbox as a boolean rather than as a string', async () => {
    const onChange = vi.fn()
    render(<ContentForm kind="wifi" values={WIFI} hint="" onChange={onChange} />)

    await userEvent.click(screen.getByLabelText('Network does not broadcast its name'))
    expect(onChange).toHaveBeenCalledWith('hidden', true)
  })
})
