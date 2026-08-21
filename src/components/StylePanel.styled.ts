import styled from 'styled-components'

export const Panel = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 20px 24px;
  padding: 20px 0 0;
  border-top: 1px solid var(--line);
  margin-top: 24px;

  @media print {
    display: none;
  }
`

export const Group = styled.div`
  min-width: 0;

  p {
    margin: 8px 0 0;
    font-size: var(--font-tiny);
    line-height: 1.5;
    color: var(--dim);
  }
`

export const RangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    font-size: var(--font-small);
    font-variant-numeric: tabular-nums;
    color: var(--dim);
    min-width: 1ch;
  }
`

export const Range = styled.input`
  flex: 1;
  min-width: 0;
  accent-color: var(--text);
  height: 24px;
  cursor: pointer;
`
