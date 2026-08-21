import { CAPTION_FONT, type Drawing } from './render'

/**
 * How wide the caption is, in the drawing's own units.
 *
 * PDF has no way to centre a line of text: it places a baseline at a point, so something
 * has to know the width first. PostScript can do it itself and SVG has `text-anchor`, so
 * this exists for the one format that cannot — and it asks the browser rather than
 * carrying a table of glyph widths that would only be right for one font.
 */
export function measureCaption(drawing: Drawing): number {
  if (!drawing.caption) return 0

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return drawing.caption.text.length * drawing.caption.size * 0.55

  // Measured at a large size and scaled down, because metrics at 2px are quantised.
  const sample = 100
  ctx.font = `600 ${sample}px ${CAPTION_FONT}`
  const width = ctx.measureText(drawing.caption.text).width
  return (width / sample) * drawing.caption.size
}
