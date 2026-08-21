import QRCode from 'qrcode'
import type { QRCodeErrorCorrectionLevel } from 'qrcode'

export type Ecc = 'L' | 'M' | 'Q' | 'H'

export const ECC_LEVELS: [Ecc, ...Ecc[]] = ['L', 'M', 'Q', 'H']

/** How much of the symbol can be lost and still read, per the spec's four levels. */
export const ECC_RECOVERY: Record<Ecc, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 }

export interface Matrix {
  /** Modules across, excluding the quiet zone. */
  size: number
  /** Row-major, `true` where a module is dark. */
  bits: boolean[]
  /** 1 to 40. A higher version is a denser code and needs a bigger print. */
  version: number
}

export interface MatrixResult {
  matrix: Matrix | null
  /** Set when the text cannot be encoded at all — too long for version 40 at this level. */
  error: string | null
}

export function buildMatrix(text: string, ecc: Ecc): MatrixResult {
  if (!text) return { matrix: null, error: null }

  try {
    const code = QRCode.create(text, {
      errorCorrectionLevel: ecc as QRCodeErrorCorrectionLevel,
    })
    const { size, data } = code.modules
    const bits = Array.from({ length: size * size }, (_, i) => data[i] === 1)
    return { matrix: { size, bits, version: code.version }, error: null }
  } catch {
    return {
      matrix: null,
      error: 'Too much to fit in one code. Shorten it, or drop the correction level.',
    }
  }
}

export function isDark(matrix: Matrix, row: number, col: number): boolean {
  return matrix.bits[row * matrix.size + col] === true
}
