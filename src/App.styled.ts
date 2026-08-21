import styled from 'styled-components'

export const Page = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px 64px;

  @media (max-width: 600px) {
    padding: 0 14px 48px;
  }

  @media print {
    padding: 0;
    max-width: none;
  }
`

export const Columns = styled.main`
  display: grid;
  /* The code takes a fixed column and the controls take what is left. The code is first
     in both source order and reading order, because it is the thing being made. */
  grid-template-columns: 400px minmax(0, 1fr);
  gap: 28px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  /* Printing gives you the code and nothing else, so the columns collapse and the one
     surviving child takes the whole page rather than staying in its lane. */
  @media print {
    display: block;
  }
`

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  @media (max-width: 980px) {
    gap: 16px;
  }
`

export const Foot = styled.footer`
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  font-size: var(--font-small);
  color: var(--dim);

  p {
    margin: 0;
    max-width: 72ch;
  }

  @media print {
    display: none;
  }
`
