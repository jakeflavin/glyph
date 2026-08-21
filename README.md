# Glyph

A QR code maker that runs entirely in the browser.

Live at <https://portfolio-4b9fe.web.app/glyph/>, as part of
[the portfolio](https://github.com/jakeflavin/portfolio).

## What it is

Type a link, some text, a wifi network or a contact card, and get a QR code you can
colour, brand and download as SVG or PNG. There is no account, no upload and no server.

Every code it makes is **static**: the address is written into the pattern itself. That is
the whole point. Most "free" generators hand out a *dynamic* code, which encodes a redirect
through their own domain — so the code stops working the day the subscription lapses, and
the sticker on the shop window is now a dead link. A static code has nothing to lapse.

The trade is real and worth stating: a static code cannot be repointed later, and nobody
counts the scans. If you need either of those, this is the wrong tool.

## Kinds of code

| Kind | Encodes |
|---|---|
| Link | The address, with `https://` added to a bare domain |
| Text | The text itself. Nothing opens |
| Wi-Fi | `WIFI:` — network, security and password, delimiters escaped |
| Contact | A vCard 3.0, CRLF-separated, commas escaped |
| Email | `mailto:` with the subject and body percent-encoded |
| SMS | `SMSTO:`, which is the form both phones act on |
| Phone | `tel:` |

## What can be changed

| | |
|---|---|
| Colour | The modules, the ground, and the three corner patterns on their own |
| Shape | Square, round or dot modules; square, round or circle corners |
| Logo | An image in the middle, snapped to the module grid and knocked out behind |
| Caption | A line under the code, in the downloaded file as well as on screen |
| Correction | L to H, which is what decides how much of the code a logo can cover |
| Quiet zone | 0 to 8 modules |

None of it changes what the code says, and the app checks the two things that decide
whether it still reads: the contrast between the pair of colours, and whether the
correction level is high enough for the logo covering it.

Export is SVG, PNG at four widths, a copy to the clipboard, or print.

## Running it

```bash
npm install
npm run dev
```

Checks — all three run in CI on every push, and the release requires them green:

```bash
npm run lint && npm run typecheck && npm test
```

The mark in `public/` is generated rather than drawn:

```bash
node scripts/make-icons.mjs
```

## How it is built

React 19, Vite, styled-components, TypeScript. Code generation is
[`qrcode`](https://github.com/soldair/node-qrcode), used only for `QRCode.create` — the
module matrix. Everything drawn from that matrix is this app's own: one SVG path for the
preview and the downloaded file, and a canvas pass for the PNG.

That split is deliberate. Owning the drawing is what makes colour, module shape, separate
corner colours and a logo knockout possible at all, and the preview and the file are built
from the same geometry, so what is on screen cannot drift from what is downloaded.

```
src/
  lib/payloads.ts   what each kind encodes, and the escaping each format needs
  lib/fields.ts     the form, as data: one table of fields per kind
  lib/matrix.ts     text -> modules
  lib/render.ts     modules -> geometry -> SVG, and the same geometry -> PNG
  lib/colors.ts     contrast, because a scanner reads contrast and not hue
  lib/image.ts      an uploaded logo, resized and stripped of its EXIF
  components/       everything that renders
  hooks/            state that outlives a render
```

`render.ts` is deliberately the widest module. It holds the geometry in module units —
the data path, the finder path, where a logo sits, where a caption sits — and both
renderers read from it. The preview draws that geometry as JSX so React escapes the
caption; the file draws it as a string. Neither owns the shapes.

Conventions — layout, styling, testing — are the portfolio's, in
[STANDARDS.md](https://github.com/jakeflavin/portfolio/blob/main/docs/STANDARDS.md).

## Storage

Everything is kept in `localStorage` under a `glyph.` prefix: the draft, the chosen kind,
the appearance settings, the theme, and the list of recent codes. Every app in the set
shares one origin, so the prefix is a requirement rather than a style.
