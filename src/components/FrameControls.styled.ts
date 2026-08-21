import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const SampleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const Sample = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px 0 8px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--dim);
  font-size: var(--font-small);
  cursor: pointer;

  svg {
    width: 15px;
    height: 18px;
    flex: none;
    fill: var(--text);
    opacity: 0.75;
  }

  /* The code inside the sample is the ground showing through the frame, so it inverts. */
  svg .code {
    fill: var(--bg);
  }

  &:hover {
    border-color: var(--line-strong);
    color: var(--text);
  }

  ${(props) =>
    props['aria-pressed'] === true &&
    `&& {
      background: var(--text);
      border-color: var(--text);
      color: var(--ink);
      font-weight: 600;

      svg {
        fill: var(--ink);
        opacity: 1;
      }

      svg .code {
        fill: var(--text);
      }
    }`}

  ${TOUCH} {
    min-height: 44px;
  }
`
