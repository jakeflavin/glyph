import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const Panel = styled.section`
  margin-top: 32px;
  padding-top: 22px;
  border-top: 1px solid var(--line);

  @media print {
    display: none;
  }
`

export const Head = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;

  h2 {
    font-size: var(--font-tiny);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dim);
  }
`

export const Empty = styled.p`
  margin: 0;
  font-size: var(--font-small);
  color: var(--dim);
`

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`

export const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--line);

  &:first-child {
    border-top: 1px solid var(--line);
  }
`

export const Restore = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  border: 0;
  background: none;
  color: inherit;
  text-align: left;
  padding: 10px 4px;
  cursor: pointer;

  strong {
    font-size: var(--font-small);
    font-weight: 500;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: var(--font-tiny);
    color: var(--dim);
  }

  &:hover strong {
    text-decoration: underline;
  }

  ${TOUCH} {
    padding: 12px 4px;
  }
`

export const When = styled.span`
  font-size: var(--font-tiny);
  color: var(--dim);
  white-space: nowrap;
`

export const Remove = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: none;
  border: 0;
  border-radius: var(--radius);
  background: none;
  color: var(--dim);
  cursor: pointer;

  &:hover {
    background: var(--surface-hi);
    color: var(--text);
  }

  svg {
    width: 15px;
    height: 15px;
  }

  ${TOUCH} {
    width: 44px;
    height: 44px;
  }
`
