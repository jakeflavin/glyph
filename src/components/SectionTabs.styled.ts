import styled from 'styled-components'
import { TOUCH } from './controls.styled'

/**
 * The strip sits on the card's own edge, so the panel below reads as the inside of the
 * chosen tab rather than as a second thing under a row of buttons.
 */
export const TabRow = styled.div`
  /* A grid rather than a wrapping flex row: wrapped, the last tab on its own line
     stretched the full width and read as a heading rather than as a tab. */
  display: grid;
  /* 88px gives five across on a desktop card and three at 320, where two columns left
     the fifth tab alone on a row of its own, reading as a heading rather than a tab. */
  grid-template-columns: repeat(auto-fit, minmax(82px, 1fr));
  gap: 2px;
  margin: -4px -4px 16px;
  padding: 4px;
  border-radius: var(--radius);
  background: var(--bg);
`

export const Tab = styled.button<{ $active: boolean }>`
  appearance: none;
  min-height: 32px;
  padding: 0 8px;
  border: 0;
  border-radius: calc(var(--radius) - 2px);
  background: none;
  color: var(--dim);
  font-size: var(--font-small);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: var(--text);
  }

  /* Wrapped so the selected state keeps the specificity it needs to beat :hover. */
  ${(props) =>
    props.$active &&
    `&& {
      background: var(--surface);
      box-shadow: 0 0 0 1px var(--line);
      color: var(--text);
      font-weight: 600;
    }`}

  ${TOUCH} {
    min-height: 44px;
  }
`
