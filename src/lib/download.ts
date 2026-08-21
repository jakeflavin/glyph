/**
 * Handing a file to the browser.
 *
 * Everything here happens on the page. Nothing is uploaded, which is the point of the app,
 * so the download is a blob URL and there is no server to name the file.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoking immediately cancels the download in Safari; a tick is enough.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** A filename that says what the code is for, with anything a filesystem dislikes gone. */
export function filenameFor(label: string, kind: string, extension: string): string {
  const stem =
    label
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || kind
  return `${stem}-qr.${extension}`
}
