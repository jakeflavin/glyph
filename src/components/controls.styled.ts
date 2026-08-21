import styled from 'styled-components'

/**
 * The touch floor.
 *
 * Nothing a finger has to hit is smaller than 44px on a coarse pointer. The desktop sizes
 * are kept as they are, because a 34px control is right for a mouse and a gamble for a
 * thumb.
 */
export const TOUCH = '@media (pointer: coarse), (max-width: 600px)'

export const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid ${(props) => (props.$primary ? 'var(--text)' : 'var(--line)')};
  border-radius: var(--radius);
  background: ${(props) => (props.$primary ? 'var(--text)' : 'var(--bg)')};
  color: ${(props) => (props.$primary ? 'var(--ink)' : 'var(--text)')};
  font-size: var(--font-small);
  font-weight: 500;
  cursor: pointer;
  transition:
    background 120ms ease,
    border-color 120ms ease;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$primary ? 'var(--text)' : 'var(--surface-hi)')};
    border-color: var(--line-strong);
  }

  /* The only colour in the app, and it is only ever on the one destructive control. */
  ${(props) =>
    props.$danger &&
    `&& {
      color: var(--danger);
      border-color: var(--danger);
      background: var(--bg);
    }`}

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }

  svg {
    width: 15px;
    height: 15px;
  }

  ${TOUCH} {
    min-height: 44px;
    padding: 0 16px;
  }
`

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;

  &:hover {
    background: var(--surface-hi);
    border-color: var(--line-strong);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  ${TOUCH} {
    width: 44px;
    height: 44px;
  }
`

/**
 * A joined segmented control. The selected cell inverts rather than tints, because the
 * palette has no accent hue to tint with.
 */
export const Segmented = styled.div`
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg);

  button {
    appearance: none;
    background: none;
    border: 0;
    border-left: 1px solid var(--line);
    min-height: 34px;
    padding: 0 12px;
    font-size: var(--font-small);
    font-weight: 500;
    color: var(--dim);
    cursor: pointer;
    white-space: nowrap;
  }

  button:first-child {
    border-left: 0;
  }

  button:hover {
    background: var(--surface-hi);
    color: var(--text);
  }

  button[aria-pressed='true'] {
    background: var(--text);
    color: var(--ink);
    font-weight: 600;
  }

  ${TOUCH} {
    button {
      min-height: 44px;
      min-width: 44px;
      padding: 0 14px;
    }
  }
`

export const Label = styled.label`
  display: block;
  font-size: var(--font-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dim);
  margin-bottom: 6px;
`

const field = `
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  padding: 9px 11px;

  &::placeholder {
    color: var(--dim);
    opacity: 0.7;
  }

  &:hover {
    border-color: var(--line-strong);
  }
`

export const Input = styled.input`
  ${field}
  min-height: 40px;

  ${TOUCH} {
    min-height: 44px;
    /* Under 16px iOS zooms the whole page on focus and never zooms back out. */
    font-size: 16px;
  }
`

export const Textarea = styled.textarea`
  ${field}
  resize: vertical;
  min-height: 84px;
  font-family: inherit;

  ${TOUCH} {
    font-size: 16px;
  }
`

export const Select = styled.select`
  ${field}
  min-height: 40px;
  appearance: none;
  cursor: pointer;

  ${TOUCH} {
    min-height: 44px;
    font-size: 16px;
  }
`

export const Checkbox = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: var(--font-small);
  cursor: pointer;
  min-height: 40px;

  input {
    width: 17px;
    height: 17px;
    accent-color: var(--text);
    cursor: pointer;
  }

  ${TOUCH} {
    min-height: 44px;
  }
`

/** A labelled control with an explanation under it. The unit every panel is built from. */
export const Field = styled.div`
  min-width: 0;

  p {
    margin: 8px 0 0;
    font-size: var(--font-tiny);
    line-height: 1.5;
    color: var(--dim);
  }
`

/** Two controls side by side, stacking before they get too narrow to read. */
export const Pair = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const RangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    font-size: var(--font-small);
    font-variant-numeric: tabular-nums;
    color: var(--dim);
    min-width: 2ch;
    text-align: right;
  }
`

export const Range = styled.input`
  flex: 1;
  min-width: 0;
  accent-color: var(--text);
  height: 24px;
  cursor: pointer;
`
