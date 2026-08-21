import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const Section = styled.section`
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  padding: 18px;

  @media (max-width: 600px) {
    padding: 14px;
  }

  @media print {
    display: none;
  }
`

export const Note = styled.span`
  font-size: var(--font-tiny);
  color: var(--dim);
  text-align: right;
`

export const Title = styled.h2`
  /* The title pushes whatever else is in the header to the right, whether that is a note,
     a control, or nothing at all. */
  margin-right: auto;
  font-size: var(--font-tiny);
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--dim);
`

export const Head = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  /* Side by side, the title and its note each get about fifteen characters on a phone
     and both wrap. Stacked, neither does. */
  @media (max-width: 520px) {
    flex-wrap: wrap;

    ${Note} {
      flex-basis: 100%;
      text-align: left;
    }
  }
`

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  details > & {
    margin-top: 16px;
  }
`

/** A foldable card's header. The marker is the chevron below, not the browser's own. */
export const Summary = styled.summary`
  list-style: none;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }

  details[open] > & svg {
    transform: rotate(90deg);
  }
`

export const Toggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 20px;

  svg {
    width: 14px;
    height: 14px;
    flex: none;
    color: var(--dim);
    transition: transform 120ms ease;
  }

  ${TOUCH} {
    min-height: 44px;
  }
`
