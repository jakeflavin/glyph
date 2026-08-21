import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const SwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

/**
 * A preset. The chip carries the pair it applies rather than a name alone, so the choice
 * is made by looking rather than by reading.
 */
export const Swatch = styled.button<{ $dark: string; $light: string }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 11px 0 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg);
  color: var(--dim);
  font-size: var(--font-small);
  cursor: pointer;

  span {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    flex: none;
    border: 1px solid var(--line);
    background: ${(props) =>
      `linear-gradient(135deg, ${props.$dark} 0 50%, ${props.$light} 50% 100%)`};
  }

  &:hover {
    border-color: var(--line-strong);
    color: var(--text);
  }

  /* Wrapped so the chosen state keeps the specificity it needs to beat :hover. */
  ${(props) =>
    props['aria-pressed'] === true &&
    `&& {
      border-color: var(--text);
      color: var(--text);
      font-weight: 600;
    }`}

  ${TOUCH} {
    min-height: 44px;
  }
`

/** A colour input and its hex, treated as one control. */
export const Well = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px 5px 5px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);

  input {
    width: 34px;
    height: 30px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: none;
    cursor: pointer;
  }

  /* The swatch fills its input on every engine only when both boxes are cleared. */
  input::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  input::-webkit-color-swatch {
    border: 0;
    border-radius: 2px;
  }

  input::-moz-color-swatch {
    border: 0;
    border-radius: 2px;
  }

  input:disabled {
    opacity: 0.4;
    cursor: default;
  }

  output {
    font-family: var(--font-mono);
    font-size: var(--font-tiny);
    color: var(--dim);
    letter-spacing: 0.02em;
  }

  ${TOUCH} {
    input {
      width: 44px;
      height: 36px;
    }
  }
`

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`
