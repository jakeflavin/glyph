import styled from 'styled-components'

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`

/** The image on the ground it will actually be drawn on, not on the app's own surface. */
export const Preview = styled.img<{ $light: string }>`
  width: 40px;
  height: 40px;
  flex: none;
  object-fit: contain;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: ${(props) => props.$light};
`

export const Warning = styled.p`
  && {
    margin: 8px 0 0;
    font-size: var(--font-tiny);
    line-height: 1.5;
    color: var(--danger);
  }
`
