import styled from 'styled-components'

export const Dialog = styled.dialog`
  width: min(400px, calc(100vw - 32px));
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);

  &::backdrop {
    background: rgb(0 0 0 / 0.45);
  }

  h2 {
    font-size: var(--font-body);
    margin-bottom: 8px;
  }
`

export const Text = styled.p`
  margin: 0 0 18px;
  font-size: var(--font-small);
  color: var(--dim);
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`
