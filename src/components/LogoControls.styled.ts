import styled from 'styled-components'

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`

/** The image on the ground it will actually be drawn on, not on the app's own surface. */
export const Preview = styled.img<{ $ground: string }>`
  width: 40px;
  height: 40px;
  flex: none;
  object-fit: contain;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: ${(props) => props.$ground};
`

export const Warning = styled.p`
  && {
    margin: 8px 0 0;
    font-size: var(--font-tiny);
    line-height: 1.5;
    color: var(--danger);
  }
`

export const IconRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const IconTile = styled.button`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
  }

  &:hover {
    border-color: var(--line-strong);
  }

  ${(props) =>
    props['aria-pressed'] === true &&
    `&& {
      border-color: var(--text);
      box-shadow: inset 0 0 0 1px var(--text);
    }`}

  @media (pointer: coarse), (max-width: 600px) {
    width: 44px;
    height: 44px;
  }
`
