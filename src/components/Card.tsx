import { useId, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Body, Head, Note, Section, Summary, Title, Toggle } from './Card.styled'

export interface CardProps {
  title: string
  note?: string
  /** Rendered at the end of the header row, for a control that belongs to the card. */
  action?: ReactNode
  /**
   * A card that opens rather than one that is open.
   *
   * For the work somebody does occasionally — a batch run, a look back at what they made.
   * Left open, those cards are two more screens of controls in front of the one job the
   * page is actually for.
   */
  foldable?: boolean
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * A titled surface.
 *
 * The page is a column of these rather than one flat sheet with rules across it: the app
 * has several separate jobs on one screen, and a reader needs to see where one ends.
 */
export function Card({ title, note, action, foldable, defaultOpen, children }: CardProps) {
  const id = useId()

  if (foldable) {
    return (
      <Section as="details" aria-label={title} open={defaultOpen}>
        <Summary>
          <Toggle>
            <ChevronRight aria-hidden="true" />
            <Title as="span">{title}</Title>
            {note && <Note>{note}</Note>}
          </Toggle>
        </Summary>
        <Body id={id}>{children}</Body>
      </Section>
    )
  }

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
