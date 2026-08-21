import styled from 'styled-components'

export const Page = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px 64px;

  @media (max-width: 600px) {
    padding: 0 16px 48px;
  }

  @media print {
    padding: 0;
  }
`

export const Columns = styled.main`
  display: grid;
  /* The form takes the room it needs; the code keeps a fixed, generous column beside it. */
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 40px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }

  /* Printing gives you the code and nothing else, so the two columns collapse and the
     one surviving child takes the whole page rather than staying in its lane. */
  @media print {
    display: block;
  }
`

export const Column = styled.div`
  min-width: 0;
`

/**
 * On a stacked layout the code is what people came for, so it goes first. On two columns
 * the order is source-order again, which is also the reading order for a keyboard.
 */
export const CodeColumn = styled(Column)`
  @media (max-width: 900px) {
    order: -1;
  }
`

export const FormPanel = styled.section`
  @media print {
    display: none;
  }
`

export const Foot = styled.footer`
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  font-size: var(--font-small);
  color: var(--dim);

  p {
    margin: 0;
    max-width: 62ch;
  }

  a {
    color: var(--text);
  }

  @media print {
    display: none;
  }
`
