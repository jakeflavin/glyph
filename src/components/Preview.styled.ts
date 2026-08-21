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
    max-width: 300px;
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
  max-width: 300px;
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

export const Meta = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);

  dt {
    font-size: var(--font-tiny);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dim);
  }

  dd {
    margin: 2px 0 0;
    font-size: var(--font-small);
    font-variant-numeric: tabular-nums;
  }

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

export const SizeSelect = styled.select`
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font-size: var(--font-small);
  cursor: pointer;

  ${TOUCH} {
    min-height: 44px;
    font-size: 16px;
  }
`

export const Payload = styled.details`
  summary {
    font-size: var(--font-small);
    color: var(--dim);
    cursor: pointer;
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
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  min-height: 20px;
  font-size: var(--font-tiny);
  color: var(--dim);

  @media print {
    display: none;
  }
`
