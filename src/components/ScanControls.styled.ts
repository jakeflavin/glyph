import styled from 'styled-components'
import type { ContrastVerdict } from '@/lib/colors'

/**
 * The contrast readout.
 *
 * It is the one place the app says something is wrong, so it is the one place with a
 * colour of its own — and the level is also written into the text, because a reader who
 * cannot tell the two states apart by colour still has to be told which one this is.
 */
export const Verdict = styled.p<{ $level: ContrastVerdict }>`
  margin: 0;
  padding: 10px 12px;
  border: 1px solid ${(props) => (props.$level === 'good' ? 'var(--line)' : 'var(--danger)')};
  border-radius: var(--radius);
  background: var(--bg);
  font-size: var(--font-tiny);
  line-height: 1.5;
  color: ${(props) => (props.$level === 'good' ? 'var(--dim)' : 'var(--danger)')};
`

/**
 * The read-back result.
 *
 * The app draws the code, then scans its own drawing. Nothing else on the page can say
 * "this works" rather than "this should work", so it gets a line of its own.
 */
export const Check = styled.p<{ $level: ContrastVerdict }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid ${(props) => (props.$level === 'good' ? 'var(--line)' : 'var(--danger)')};
  border-radius: var(--radius);
  background: var(--bg);
  font-size: var(--font-tiny);
  line-height: 1.5;
  color: ${(props) => (props.$level === 'good' ? 'var(--dim)' : 'var(--danger)')};

  svg {
    width: 14px;
    height: 14px;
    flex: none;
  }
`
