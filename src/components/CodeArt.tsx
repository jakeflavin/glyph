import { layerPath, paintRegistry } from '@/lib/emit-svg'
import { CAPTION_FONT, type Drawing } from '@/lib/render'

export interface CodeArtProps {
  drawing: Drawing
  /** Read out to anyone who cannot see the code, since the image itself says nothing. */
  title: string
}

/**
 * The symbol on screen.
 *
 * Built from the same plan as every downloaded format, so the preview cannot drift from
 * what is saved. It is JSX rather than the SVG file's own markup injected wholesale,
 * because the caption is text somebody typed and React escapes it here for free.
 */
export function CodeArt({ drawing, title }: CodeArtProps) {
  const { width, height } = drawing
  const paints = paintRegistry(width)

  // Read in the same order the file writes them, so both end up with the same ids.
  const background = drawing.background ? paints.ref(drawing.background.paint) : null
  const layers = drawing.layers.map((layer) => ({ layer, fill: paints.ref(layer.paint) }))
  const caption = drawing.caption
    ? { ...drawing.caption, fill: paints.ref(drawing.caption.paint) }
    : null
  const defs = paints.defs.join('')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={title}
      shapeRendering={drawing.crisp ? 'crispEdges' : undefined}
    >
      {/*
        Gradient definitions, built entirely from numbers and colours this app generated.
        No text anyone typed reaches them, which is what makes injecting them safe — the
        caption below is a JSX child precisely because it is not.
      */}
      {defs && <defs dangerouslySetInnerHTML={{ __html: defs }} />}

      {background && (
        <rect
          width={width}
          height={height}
          rx={drawing.background ? drawing.background.round * width : 0}
          ry={drawing.background ? drawing.background.round * width : 0}
          fill={background}
        />
      )}

      {layers.map((entry, index) => (
        <path
          key={index}
          fill={entry.fill}
          fillRule={entry.layer.holes?.length ? 'evenodd' : undefined}
          d={layerPath(entry.layer)}
        />
      ))}

      {drawing.logo && (
        <>
          {drawing.logo.round && (
            <clipPath id="g-logo-clip">
              <circle
                cx={drawing.logo.x + drawing.logo.size / 2}
                cy={drawing.logo.y + drawing.logo.size / 2}
                r={drawing.logo.size / 2}
              />
            </clipPath>
          )}
          <image
            x={drawing.logo.x}
            y={drawing.logo.y}
            width={drawing.logo.size}
            height={drawing.logo.size}
            preserveAspectRatio="xMidYMid meet"
            clipPath={drawing.logo.round ? 'url(#g-logo-clip)' : undefined}
            href={drawing.logo.src}
          />
        </>
      )}

      {caption && (
        <text
          x={caption.x}
          y={caption.y}
          fill={caption.fill}
          fontFamily={CAPTION_FONT}
          fontSize={caption.size}
          fontWeight={600}
          textAnchor="middle"
        >
          {caption.text}
        </text>
      )}
    </svg>
  )
}
