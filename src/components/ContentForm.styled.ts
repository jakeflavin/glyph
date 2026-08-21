import styled from 'styled-components'

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
  margin-bottom: 14px;

  /* Two columns of name fields stop being readable well before the phone breakpoint. */
  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const Cell = styled.div<{ $wide: boolean }>`
  min-width: 0;

  ${(props) => props.$wide && 'grid-column: 1 / -1;'}
`
