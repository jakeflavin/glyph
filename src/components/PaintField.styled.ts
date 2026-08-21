import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  & + & {
    margin-top: 10px;
  }

  /* The follow toggle sits beside the type control and matches its height rather than the
     button height, so the row reads as one strip. */
  .follow {
    appearance: none;
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--dim);
    font-size: var(--font-small);
    font-weight: 500;
    cursor: pointer;
  }

  .follow:hover {
    border-color: var(--line-strong);
    color: var(--text);
  }

  .follow[aria-pressed='true'] {
    background: var(--text);
    border-color: var(--text);
    color: var(--ink);
  }

  ${TOUCH} {
    .follow {
      min-height: 44px;
    }
  }
`

/** The paint itself, at a size where a gradient is actually visible. */
export const Swatch = styled.span<{ $css: string; $muted: boolean }>`
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: ${(props) => props.$css};
  opacity: ${(props) => (props.$muted ? 0.35 : 1)};

  ${TOUCH} {
    width: 44px;
    height: 44px;
  }
`

export const Well = styled.div<{ $muted: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  opacity: ${(props) => (props.$muted ? 0.5 : 1)};

  input {
    width: 30px;
    height: 26px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: none;
    cursor: pointer;
  }

  input::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  input::-webkit-color-swatch,
  input::-moz-color-swatch {
    border: 0;
    border-radius: 2px;
  }

  input:disabled {
    cursor: default;
  }

  output {
    font-family: var(--font-mono);
    font-size: var(--font-tiny);
    color: var(--dim);
  }

  ${TOUCH} {
    /* The swatch is the control on a phone: it is what a finger goes for, so it fills
       the well's height rather than sitting inside its padding. */
    padding: 0 12px 0 0;
    overflow: hidden;

    input {
      width: 48px;
      height: 44px;
      border: 0;
      border-radius: 0;
    }
  }
`

export const Angle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;

  label {
    font-size: var(--font-tiny);
    color: var(--dim);
  }

  input {
    flex: 1;
    min-width: 0;
    accent-color: var(--text);
    height: 24px;
    cursor: pointer;
  }

  span {
    font-size: var(--font-tiny);
    color: var(--dim);
    font-variant-numeric: tabular-nums;
    min-width: 4ch;
    text-align: right;
  }
`
