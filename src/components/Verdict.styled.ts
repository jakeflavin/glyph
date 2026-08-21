import styled from 'styled-components'

/**
 * One check, one line.
 *
 * The state is written into the text as well as shown in the colour, because a reader who
 * cannot tell the two apart by colour still has to be told which one this is.
 */
export const Line = styled.p<{ $level: 'good' | 'bad' | 'wait' }>`
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  font-size: var(--font-tiny);
  line-height: 1.5;
  color: ${(props) => (props.$level === 'bad' ? 'var(--danger)' : 'var(--dim)')};

  svg {
    width: 14px;
    height: 14px;
    flex: none;
  }

  @media print {
    display: none;
  }
`
