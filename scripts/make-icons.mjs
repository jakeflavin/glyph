/**
 * Writes the mark: `public/favicon.svg` and the home-screen PNGs.
 *
 * iOS ignores an SVG apple-touch-icon, so the PNGs have to exist as files. They are
 * generated here and committed rather than built, which keeps an image library out of the
 * dependency list for four small assets.
 *
 * The SVG is generated from the same grid as the PNGs rather than drawn by hand, because
 * the two drifting apart is exactly what happens otherwise.
 */
import { writeFileSync } from 'node:fs'
import { writeIcons } from './icon-png.mjs'

const OUT = new URL('../public/', import.meta.url)

const PAPER = [255, 255, 255]
const INK = [17, 17, 17]

const GRID = 11
const MARGIN = 1
const SPAN = GRID + MARGIN * 2

/** A finder pattern: the 5x5 ring with a filled centre, which is what says "QR code". */
function finder(row, col, top, left) {
  const r = row - top
  const c = col - left
  if (r < 0 || r > 4 || c < 0 || c > 4) return null
  const onRing = r === 0 || r === 4 || c === 0 || c === 4
  return onRing || (r === 2 && c === 2)
}

/**
 * The mark, as modules. Three finders and a fixed scatter between them — the scatter is
 * not real data, it is there so the mark reads as a code rather than as three squares.
 */
function isDark(row, col) {
  for (const [top, left] of [
    [0, 0],
    [0, GRID - 5],
    [GRID - 5, 0],
  ]) {
    const hit = finder(row, col, top, left)
    if (hit !== null) return hit
  }
  return (row * 7 + col * 5 + Math.floor(row / 2)) % 3 === 0
}

const MODULES = []
for (let row = 0; row < GRID; row += 1) {
  for (let col = 0; col < GRID; col += 1) {
    if (isDark(row, col)) MODULES.push([row, col])
  }
}

const rgb = (channels) => `rgb(${channels.join(' ')})`

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SPAN} ${SPAN}" shape-rendering="crispEdges">`,
  '  <!-- The mark is a QR code that says nothing: three finders and a fixed scatter. -->',
  `  <rect width="${SPAN}" height="${SPAN}" fill="${rgb(PAPER)}"/>`,
  `  <path fill="${rgb(INK)}" d="${MODULES.map(([row, col]) => `M${col + MARGIN} ${row + MARGIN}h1v1h-1z`).join('')}"/>`,
  '</svg>',
  '',
].join('\n')

writeFileSync(new URL('favicon.svg', OUT), svg)
console.log('wrote favicon.svg')

function render(size) {
  const pixels = new Array(size * size)
  const unit = size / SPAN
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const col = Math.floor(x / unit) - MARGIN
      const row = Math.floor(y / unit) - MARGIN
      const dark = row >= 0 && row < GRID && col >= 0 && col < GRID && isDark(row, col)
      pixels[y * size + x] = dark ? INK : PAPER
    }
  }
  return pixels
}

for (const size of writeIcons(OUT, [180, 192, 512], render)) {
  console.log(`wrote icon-${size}.png`)
}
