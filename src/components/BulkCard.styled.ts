import styled from 'styled-components'

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`

export const Status = styled.p<{ $bad?: boolean }>`
  margin: 0;
  font-size: var(--font-tiny);
  line-height: 1.5;
  color: ${(props) => (props.$bad ? 'var(--danger)' : 'var(--dim)')};
`
