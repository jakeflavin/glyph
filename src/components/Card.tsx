import { useId, useState, type ReactNode } from 'react'
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
  /** Read once, when the card mounts. After that the fold is the reader's. */
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

  /*
   * Seeded from `defaultOpen` and owned by the reader from then on.
   *
   * Driven straight from the prop, a card whose `defaultOpen` was derived from its own
   * contents closed itself the moment those contents went — so clearing a list folded the
   * card that was showing it, and the only acknowledgement of a destructive action was the
   * disappearance of the thing you acted on.
   */
  const [open, setOpen] = useState(defaultOpen ?? false)

  if (foldable) {
    return (
      <Section
        as="details"
        aria-label={title}
        open={open}
        onToggle={(event: React.SyntheticEvent<HTMLDetailsElement>) =>
          setOpen(event.currentTarget.open)
        }
      >
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
