import styled from 'styled-components'
import { TOUCH } from './controls.styled'

export const Panel = styled.section`
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  /* Stacked, the column is as wide as the page, and a 340px code centred in a 900px
     slab of paper reads as a banner rather than as a card. The whole panel narrows. */
  @media (max-width: 900px) {
    position: static;
    max-width: 420px;
    margin: 0 auto;
  }

  @media print {
    position: static;
    max-width: none;
  }
`

export const Paper = styled.figure`
  margin: 0;
  padding: 18px;
  border: 1px solid var(--paper-line);
  border-radius: var(--radius);
  background: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: block;
    width: 100%;
    height: auto;
    max-width: 340px;
  }

  /* On a phone the code is the first thing on the page, and at 340px it fills the
     screen on its own — the tabs below it would never be seen without a scroll. */
  @media (max-width: 600px) {
    padding: 14px;

    svg {
      max-width: 240px;
    }
  }

  @media print {
    border: 0;
    padding: 0;

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
  background: var(--bg);

  @media (max-width: 600px) {
    max-width: 240px;
  }
`

export const Meta = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;

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
  border-top: 1px solid var(--line);
  padding-top: 12px;

  summary {
    font-size: var(--font-small);
    color: var(--dim);
    cursor: pointer;
  }

  pre {
    margin: 10px 0 0;
    padding: 10px;
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: var(--font-tiny);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 180px;
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
  font-size: var(--font-small);
  color: var(--dim);

  @media print {
    display: none;
  }
`
