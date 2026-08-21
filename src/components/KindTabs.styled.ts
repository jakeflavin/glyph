import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const TabRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;

  @media print {
    display: none;
  }
`

export const Tab = styled.button<{ $active: boolean }>`
  appearance: none;
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg);
  color: var(--dim);
  font-size: var(--font-small);
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-color: var(--line-strong);
    color: var(--text);
  }

  /* Wrapped so the selected state keeps the specificity it needs to beat :hover — as a
     bare transient prop the declarations score lower and a hovered tab loses its fill. */
  ${(props) =>
    props.$active &&
    `&& {
      background: var(--text);
      border-color: var(--text);
      color: var(--ink);
      font-weight: 600;
    }`}

  ${TOUCH} {
    min-height: 44px;
    padding: 0 16px;
  }
`
