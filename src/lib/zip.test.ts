import { describe, expect, it } from 'vitest'
import { toZip } from './zip'

async function bytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer())
}

function u32(data: Uint8Array, at: number): number {
  return (data[at]! | (data[at + 1]! << 8) | (data[at + 2]! << 16) | (data[at + 3]! << 24)) >>> 0
}

describe('toZip', () => {
  it('writes an archive a reader can find its way around', async () => {
    const archive = await bytes(
      await toZip([
        { name: 'one.txt', blob: new Blob(['hello']) },
        { name: 'two.txt', blob: new Blob(['world!']) },
      ]),
    )

    // Local header, then the central directory, then the end record.
    expect(u32(archive, 0)).toBe(0x04034b50)
    const end = archive.length - 22
    expect(u32(archive, end)).toBe(0x06054b50)

    const count = archive[end + 10]! | (archive[end + 11]! << 8)
    expect(count).toBe(2)

    // The directory offset in the end record has to land on a directory header.
    const directory = u32(archive, end + 16)
    expect(u32(archive, directory)).toBe(0x02014b50)
  })

  it('stores rather than compresses, so the bytes go in whole', async () => {
    const archive = await bytes(await toZip([{ name: 'a.txt', blob: new Blob(['abc']) }]))
    const method = archive[8]! | (archive[9]! << 8)
    expect(method).toBe(0)
    expect(new TextDecoder().decode(archive).includes('abc')).toBe(true)
  })

  it('is an empty archive for no files at all', async () => {
    const archive = await bytes(await toZip([]))
    expect(archive.length).toBe(22)
    expect(u32(archive, 0)).toBe(0x06054b50)
  })
})
