import type { ReactNode } from 'react'
import { Body, Head, Note, Section, Title } from './Card.styled'

export interface CardProps {
  title: string
  note?: string
  /** Rendered at the end of the header row, for a control that belongs to the card. */
  action?: ReactNode
  children: ReactNode
}

/**
 * A titled surface.
 *
 * The page is a column of these rather than one flat sheet with rules across it: the app
 * has four separate jobs on one screen — what the code says, how it looks, whether it
 * scans, what you made earlier — and a reader needs to see where one ends.
 */
export function Card({ title, note, action, children }: CardProps) {
  return (
    <Section aria-label={title}>
      <Head>
        <Title>{title}</Title>
        {note && <Note>{note}</Note>}
        {action}
      </Head>
      <Body>{children}</Body>
    </Section>
  )
}
