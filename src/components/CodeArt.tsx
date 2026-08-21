import { COLOURS, modulesPath, spanOf, type Style } from '@/lib/render'
import type { Matrix } from '@/lib/matrix'

export interface CodeArtProps {
  matrix: Matrix
  style: Style
  /** Read out to anyone who cannot see the code, since the image itself says nothing. */
  title: string
}

/**
 * The symbol on screen.
 *
 * The same path string that goes into the downloaded file is what renders here, so the
 * preview cannot drift from the file. It is one path rather than a rect per module: a
 * version 40 code is 31k modules, and 31k elements stutters while typing.
 */
export function CodeArt({ matrix, style, title }: CodeArtProps) {
  const span = spanOf(matrix, style)

  return (
    <svg
      viewBox={`0 0 ${span} ${span}`}
      role="img"
      aria-label={title}
      shapeRendering={style.shape === 'square' ? 'crispEdges' : undefined}
    >
      <rect width={span} height={span} fill={style.invert ? COLOURS.dark : COLOURS.light} />
      <path fill={style.invert ? COLOURS.light : COLOURS.dark} d={modulesPath(matrix, style)} />
    </svg>
  )
}
