import styled from 'styled-components'
import { Segmented } from './controls.styled'

export const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 0 24px;

  @media print {
    display: none;
  }
`

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h1 {
    font-size: 19px;
    letter-spacing: -0.01em;
  }

  p {
    margin: 1px 0 0;
    font-size: var(--font-small);
    color: var(--dim);
  }

  /* The tagline wraps to two lines beside the theme control and pushes the whole header
     taller than the code it introduces. It is decoration, so it goes. */
  @media (max-width: 420px) {
    p {
      display: none;
    }
  }
`

export const Mark = styled.svg`
  width: 30px;
  height: 30px;
  flex: none;
  fill: var(--text);
  shape-rendering: crispEdges;
`

export const Toggle = styled(Segmented)`
  && button {
    width: 40px;
    padding: 0;
  }

  && svg {
    width: 15px;
    height: 15px;
  }

  @media (pointer: coarse), (max-width: 600px) {
    && button {
      width: 44px;
    }
  }
`
