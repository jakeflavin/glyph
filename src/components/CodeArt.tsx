import {
  CAPTION_FONT,
  captionLayout,
  coloursOf,
  dataPath,
  eyePath,
  logoBox,
  viewBoxOf,
  type Style,
} from '@/lib/render'
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
 * Built from the same geometry as the downloaded file, so the preview cannot drift from
 * what is saved. It is drawn as JSX rather than by injecting the file's own markup,
 * because the caption is text somebody typed and React escapes it here for free.
 */
export function CodeArt({ matrix, style, title }: CodeArtProps) {
  const { width, height } = viewBoxOf(matrix, style)
  const { dark, light, eye } = coloursOf(style)
  const logo = logoBox(matrix, style)
  const caption = captionLayout(matrix, style)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={title}
      shapeRendering={style.shape === 'square' ? 'crispEdges' : undefined}
    >
      <rect width={width} height={height} fill={light} />
      <path fill={dark} d={dataPath(matrix, style)} />
      <path fill={eye} fillRule="evenodd" d={eyePath(matrix, style)} />

      {logo && style.logo && (
        <>
          <rect x={logo.x} y={logo.y} width={logo.size} height={logo.size} fill={light} />
          <image
            x={logo.x + logo.size * 0.08}
            y={logo.y + logo.size * 0.08}
            width={logo.size * 0.84}
            height={logo.size * 0.84}
            preserveAspectRatio="xMidYMid meet"
            href={style.logo.src}
          />
        </>
      )}

      {caption && (
        <text
          x={caption.x}
          y={caption.y}
          fill={dark}
          fontFamily={CAPTION_FONT}
          fontSize={caption.fontSize}
          fontWeight={600}
          textAnchor="middle"
        >
          {caption.text}
        </text>
      )}
    </svg>
  )
}
