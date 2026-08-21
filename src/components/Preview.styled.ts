import styled from 'styled-components'
import { TOUCH } from './controls.styled'

/**
 * The code's own surface, and the one panel that stays put.
 *
 * Sticky is what makes the left column work: every control is on the right, and the point
 * of putting the code opposite them is that it is still on screen when you reach the last
 * of them.
 */
export const Panel = styled.section`
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);

  @media (max-width: 980px) {
    position: static;
    max-width: 460px;
    margin: 0 auto;
    width: 100%;
  }

  @media (max-width: 600px) {
    padding: 14px;
  }

  @media print {
    position: static;
    max-width: none;
    border: 0;
    padding: 0;
    background: none;
  }
`

/**
 * The code sits on its own ground rather than on the app's.
 *
 * The symbol paints its own background — that colour is part of what gets downloaded — so
 * this is only the frame around it, and it holds the code's shape while it is empty.
 */
export const Paper = styled.figure`
  margin: 0;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: block;
    width: 100%;
    height: auto;
    max-width: 340px;
    border-radius: 2px;
  }

  @media (max-width: 600px) {
    padding: 12px;

    svg {
      max-width: 240px;
    }
  }

  @media print {
    border: 0;
    padding: 0;
    /* The frame is the app's, not the code's. On paper only the code's own ground shows. */
    background: none;

    svg {
      max-width: 90mm;
      margin: 0 auto;
    }
  }
`

/** The empty and the over-capacity states stand in for the code, at its size. */
export const Placeholder = styled.div`
  aspect-ratio: 1;
  width: 100%;
  max-width: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  border: 1px dashed var(--line);
  border-radius: var(--radius);
  color: var(--dim);
  font-size: var(--font-small);

  @media (max-width: 600px) {
    max-width: 240px;
  }
`

/** Version, size and recovery: worth knowing, not worth a table. */
export const Meta = styled.p`
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  font-size: var(--font-tiny);
  color: var(--dim);
  font-variant-numeric: tabular-nums;

  @media print {
    display: none;
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media print {
    display: none;
  }

  ${TOUCH} {
    button,
    select {
      flex: 1 1 auto;
    }
  }
`

export const Select = styled.select`
  min-height: 36px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font-size: var(--font-small);
  cursor: pointer;

  ${TOUCH} {
    min-height: 44px;
    /* Under 16px iOS zooms the whole page on focus and never zooms back out. */
    font-size: 16px;
  }
`

/**
 * The three things that are not downloading.
 *
 * Given the same weight as the download they sat beside it as three more buttons, and the
 * panel read as eleven equal choices. They are secondary, so they look it.
 */
export const Quiet = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--dim);
    font-size: var(--font-tiny);
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    color: var(--text);
    text-decoration: underline;
  }

  button:disabled {
    opacity: 0.45;
    cursor: default;
  }

  svg {
    width: 13px;
    height: 13px;
  }

  ${TOUCH} {
    gap: 8px 18px;

    button {
      min-height: 44px;
      font-size: var(--font-small);
    }
  }

  @media print {
    display: none;
  }
`

export const Payload = styled.details`
  summary {
    display: flex;
    align-items: center;
    min-height: 24px;
    font-size: var(--font-small);
    color: var(--dim);
    cursor: pointer;
  }

  ${TOUCH} {
    summary {
      min-height: 44px;
    }
  }

  pre {
    margin: 10px 0 0;
    padding: 10px;
    border-radius: var(--radius);
    background: var(--bg);
    border: 1px solid var(--line);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: var(--font-tiny);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 160px;
    overflow: auto;
  }

  @media print {
    display: none;
  }
`

export const Status = styled.p`
  margin: 0;
  font-size: var(--font-small);
  color: var(--danger);
`

/** Transient confirmation after a download or a copy. Holds its line so nothing jumps. */
export const Note = styled.p`
  margin: 0;
  min-height: 34px;
  font-size: var(--font-tiny);
  line-height: 1.5;
  color: var(--dim);

  @media print {
    display: none;
  }
`
