import styled from 'styled-components'

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
`
