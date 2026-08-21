/**
 * Taking a picture in from the person using the app.
 *
 * It is re-encoded rather than stored as it arrived. Three reasons, in order: a logo is
 * drawn at a few hundred pixels and a phone photo is four thousand, so the code would
 * carry megabytes it cannot use; the settings live in localStorage, which is a handful of
 * megabytes for the whole origin; and re-encoding through a canvas drops the EXIF, which
 * on a phone photo includes where it was taken.
 */

/** Large enough for the biggest export, small enough to sit in storage. */
const MAX_EDGE = 512

export const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/svg+xml'

export async function readLogoFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('That is not an image.')

  const source = await readAsDataUrl(file)
  const image = await decode(source)

  // An SVG is already small and stays sharp at any size, so it is kept as it came.
  if (file.type === 'image/svg+xml') return source

  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser would not give us a canvas.')
  ctx.drawImage(image, 0, 0, width, height)

  // PNG, not JPEG: a logo is usually flat colour with an edge, and JPEG rings around one.
  return canvas.toDataURL('image/png')
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('That file could not be read.'))
    reader.readAsDataURL(file)
  })
}

function decode(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('That image could not be read.'))
    image.src = src
  })
}
