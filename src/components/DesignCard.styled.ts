import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

/** The saved looks, kept apart from the controls they save. */
export const Looks = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const SaveRow = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    min-width: 0;
  }
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
    min-height: 32px;
    padding: 0 6px 0 9px;
    border: 0;
    background: none;
    color: var(--text);
    font-size: var(--font-small);
    cursor: pointer;
  }

  button span {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex: none;
    border: 1px solid var(--line);
    background: ${(props) => props.$css};
  }

  button.forget {
    width: 26px;
    padding: 0;
    color: var(--dim);
  }

  button.forget:hover {
    color: var(--danger);
  }

  button.forget svg {
    width: 13px;
    height: 13px;
  }

  &:hover {
    border-color: var(--line-strong);
  }

  ${TOUCH} {
    button {
      min-height: 44px;
    }

    button.forget {
      width: 38px;
    }
  }
`

/** Quiet, because it is a way back rather than a thing to do. */
export const Reset = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 24px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dim);
  font-size: var(--font-tiny);
  cursor: pointer;

  &:hover {
    color: var(--text);
    text-decoration: underline;
  }

  svg {
    width: 12px;
    height: 12px;
  }

  ${TOUCH} {
    min-height: 44px;
    font-size: var(--font-small);
  }
`
