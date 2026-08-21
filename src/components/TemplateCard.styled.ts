import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  input {
    flex: 1 1 160px;
    min-width: 0;
  }
`

export const Empty = styled.p`
  margin: 0;
  font-size: var(--font-small);
  color: var(--dim);
`

export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const Chip = styled.div<{ $css: string }>`
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg);
  overflow: hidden;

  button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    padding: 0 6px 0 8px;
    border: 0;
    background: none;
    color: var(--text);
    font-size: var(--font-small);
    cursor: pointer;
  }

  button span {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    flex: none;
    border: 1px solid var(--line);
    background: ${(props) => props.$css};
  }

  &:hover {
    border-color: var(--line-strong);
  }

  ${TOUCH} {
    button {
      min-height: 44px;
    }
  }
`

export const Forget = styled.button`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    min-height: 34px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--dim);
    cursor: pointer;
  }

  &&:hover {
    color: var(--danger);
  }

  svg {
    width: 13px;
    height: 13px;
  }

  ${TOUCH} {
    && {
      width: 40px;
      min-height: 44px;
    }
  }
`
