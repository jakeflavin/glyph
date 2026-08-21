import '@testing-library/jest-dom'

/*
 * jsdom has no media queries at all, and every app in this set reads one — the theme
 * hooks watch prefers-color-scheme, and roll asks whether there is a pointer worth
 * showing keyboard shortcuts for. Without this, rendering any of them throws.
 *
 * Nothing matches, which is the honest answer for a headless DOM with no device behind
 * it. A test that needs a query to match overrides this stub.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

/*
 * jsdom's Blob has no `arrayBuffer`, which the zip writer needs to read what it is given.
 * The shim is the same shape as the one above: the browser has it, the headless DOM does
 * not, and the code under test is not the thing that is wrong.
 */
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}
