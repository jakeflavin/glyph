import { Monitor, Moon, Sun } from 'lucide-react'
import type { Theme } from '@/hooks/useTheme'
import { Bar, Brand, Mark, Toggle } from './Header.styled'

const OPTIONS: [{ id: Theme; label: string }, ...{ id: Theme; label: string }[]] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
]

const ICONS = { light: Sun, dark: Moon, system: Monitor }

export interface HeaderProps {
  theme: Theme
  onTheme: (theme: Theme) => void
}

export function Header({ theme, onTheme }: HeaderProps) {
  return (
    <Bar>
      <Brand>
        <Mark aria-hidden="true" viewBox="0 0 9 9">
          {/* A finder pattern, which is the part of a QR code everyone recognises. */}
          <path d="M0 0h7v7h-7z" />
          <path d="M1 1h5v5h-5z" fill="var(--bg)" />
          <path d="M2 2h3v3h-3z" />
        </Mark>
        <div>
          <h1>Glyph</h1>
          <p>QR codes that keep working</p>
        </div>
      </Brand>

      <Toggle role="group" aria-label="Theme">
        {OPTIONS.map((option) => {
          const Icon = ICONS[option.id]
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === theme}
              aria-label={option.label}
              title={option.label}
              onClick={() => onTheme(option.id)}
            >
              <Icon aria-hidden="true" />
            </button>
          )
        })}
      </Toggle>
    </Bar>
  )
}
