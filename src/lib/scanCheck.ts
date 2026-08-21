/**
 * Reading the code back.
 *
 * Every other generator lets you style a code until it stops working and says nothing. The
 * browser has a barcode reader built in, so the app can simply try to scan what it drew
 * and tell you — which turns "does this still work?" from a question you answer by
 * printing it into one the page answers while you type.
 *
 * The check is deliberately harsher than a phone: the code is rendered small, at 240px
 * across, so a style that only survives at poster size fails here rather than in a shop.
 */
const TEST_WIDTH = 240

export type ScanResult = 'unsupported' | 'ok' | 'wrong' | 'unreadable'

interface Detector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>
}

type DetectorConstructor = new (options: { formats: string[] }) => Detector

function detectorClass(): DetectorConstructor | null {
  const global = window as unknown as { BarcodeDetector?: DetectorConstructor }
  return global.BarcodeDetector ?? null
}

export function scanCheckSupported(): boolean {
  return detectorClass() !== null
}

/**
 * `render` draws the code at the width it is given. The canvas is padded because a reader
 * expects a quiet zone whatever the code was drawn with, and a code with its quiet zone
 * turned down should still be judged on the code rather than on the crop.
 */
export async function scanCheck(
  render: (pixels: number) => Promise<HTMLCanvasElement>,
  expected: string,
): Promise<ScanResult> {
  const Detector = detectorClass()
  if (!Detector) return 'unsupported'

  const drawn = await render(TEST_WIDTH)
  const pad = 24
  const canvas = document.createElement('canvas')
  canvas.width = drawn.width + pad * 2
  canvas.height = drawn.height + pad * 2

  const ctx = canvas.getContext('2d')
  if (!ctx) return 'unsupported'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(drawn, pad, pad)

  try {
    const found = await new Detector({ formats: ['qr_code'] }).detect(canvas)
    if (found.length === 0) return 'unreadable'
    return found.some((code) => code.rawValue === expected) ? 'ok' : 'wrong'
  } catch {
    return 'unsupported'
  }
}
