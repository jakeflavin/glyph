/**
 * A ZIP file, stored rather than compressed.
 *
 * Written here rather than pulled in: the whole format, for the one case of "several
 * files, no folders", is the ninety lines below, and everything going into it is a PNG or
 * an SVG — a PNG is already deflated, so compressing it again buys a percent and costs a
 * dependency and a worker.
 *
 * Only the fields a reader actually needs are filled in: local headers, central directory,
 * end record. No zip64, so the archive is limited to 4GB, which a sheet of QR codes is
 * some distance from.
 */

interface Entry {
  name: string
  bytes: Uint8Array
  crc: number
  offset: number
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

class Writer {
  private parts: Uint8Array[] = []
  length = 0

  push(bytes: Uint8Array): void {
    this.parts.push(bytes)
    this.length += bytes.length
  }

  /** Little-endian, which is the only byte order the format uses. */
  u16(value: number): void {
    this.push(new Uint8Array([value & 0xff, (value >> 8) & 0xff]))
  }

  u32(value: number): void {
    this.push(
      new Uint8Array([
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff,
      ]),
    )
  }

  text(value: string): void {
    this.push(new TextEncoder().encode(value))
  }

  blob(type: string): Blob {
    return new Blob(this.parts as BlobPart[], { type })
  }
}

export async function toZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const writer = new Writer()
  const entries: Entry[] = []

  for (const file of files) {
    const bytes = new Uint8Array(await file.blob.arrayBuffer())
    const entry: Entry = { name: file.name, bytes, crc: crc32(bytes), offset: writer.length }
    entries.push(entry)

    writer.u32(0x04034b50)
    writer.u16(20) // version needed
    writer.u16(0x0800) // the name is UTF-8
    writer.u16(0) // stored
    writer.u16(0) // time
    writer.u16(0) // date
    writer.u32(entry.crc)
    writer.u32(bytes.length)
    writer.u32(bytes.length)
    writer.u16(new TextEncoder().encode(entry.name).length)
    writer.u16(0)
    writer.text(entry.name)
    writer.push(bytes)
  }

  const directory = writer.length
  for (const entry of entries) {
    writer.u32(0x02014b50)
    writer.u16(20) // version made by
    writer.u16(20) // version needed
    writer.u16(0x0800)
    writer.u16(0)
    writer.u16(0)
    writer.u16(0)
    writer.u32(entry.crc)
    writer.u32(entry.bytes.length)
    writer.u32(entry.bytes.length)
    writer.u16(new TextEncoder().encode(entry.name).length)
    writer.u16(0)
    writer.u16(0)
    writer.u16(0)
    writer.u16(0)
    writer.u32(0)
    writer.u32(entry.offset)
    writer.text(entry.name)
  }

  const size = writer.length - directory
  writer.u32(0x06054b50)
  writer.u16(0)
  writer.u16(0)
  writer.u16(entries.length)
  writer.u16(entries.length)
  writer.u32(size)
  writer.u32(directory)
  writer.u16(0)

  return writer.blob('application/zip')
}
