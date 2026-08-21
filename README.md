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
| WhatsApp | `wa.me`, with the number stripped to digits |
| Event | A one-event `VCALENDAR`, in the reader's own timezone |
| Location | A `geo:` URI |
| Crypto | BIP-21 and the schemes that copied it |

## What can be changed

| | |
|---|---|
| Colour | Flat, or a linear or radial gradient, on the modules and on the ground |
| Corner colour | The finder frames and their centres, each on their own or following |
| Module shape | Square, rounded, smooth, classy, dots, diamond, or merged into rows or columns |
| Corner shape | Frame and centre separately: square, rounded, circle, leaf, cushion, diamond |
| Logo | An uploaded image or one of six built-in marks, sized, with clearance, knocked out or not, square or round |
| Frame | None, an outline, a caption bar, or a card, with the caption above or below |
| Correction | L to H, which is what decides how much of the code a logo can cover |
| Quiet zone | 0 to 8 modules, and rounded corners on the background |
| Transparency | No background at all, for SVG and PNG |

None of it changes what the code says.

## The two checks

Every other generator lets you style a code until it stops working and says nothing.

- **Contrast** is measured across both ends of both paints, since a scanner thresholds the
  image rather than reading hue, and a gradient can fail at one end only.
- **The code is read back.** The app draws it at 240 pixels across — smaller than a phone
  would meet it — and decodes its own drawing with the browser's barcode reader. What it
  reports is that this code scans, rather than that it should.

## Getting the file out

SVG, PNG at four widths, JPEG, WEBP, PDF, EPS, a copy to the clipboard as an image or as
SVG markup, or print.

PDF and EPS are vector and 80 mm wide. The PDF carries real gradient shadings; EPS is
PostScript Level 2 and has no gradient, so it flattens — and both leave out a logo, which
the app tells you before you download one.

## More than one at a time

Paste a list, one code per line, add `, a name` to any of them to name its file, and the
whole lot comes back as a single zip — PNG or SVG, in whatever style is set above. It runs
in the tab, on the same renderer, and touches no server. The zip writer is in `lib/zip.ts`
for the same reason as everything else here: the format, for this one case, is shorter than
the dependency would be.

A style can also be kept under a name and re-applied, which is the paid tools' brand kit,
except it is a row of chips in `localStorage`.

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
  lib/payloads.ts    what each kind encodes, and the escaping each format needs
  lib/fields.ts      the form, as data: one table of fields per kind
  lib/matrix.ts      text -> modules
  lib/shapes.ts      every shape, as one primitive: a rounded rect with four radii
  lib/paint.ts       a fill: one colour, or two with a direction
  lib/render.ts      modules + style -> a drawing, in module units
  lib/emit-svg.ts    a drawing -> SVG
  lib/emit-raster.ts a drawing -> canvas -> PNG, JPEG, WEBP
  lib/emit-vector.ts a drawing -> PDF, and -> EPS
  lib/scanCheck.ts   draw it, then read it back
  lib/colors.ts      contrast, because a scanner reads contrast and not hue
  lib/zip.ts         a stored-not-compressed archive, for the bulk run
  components/        everything that renders
  hooks/             state that outlives a render
```

The shape of it is one plan and five renderers. `render.ts` decides *what* to draw — the
data prims, the finder rings, where a logo sits, where a caption sits — in module units,
and knows nothing about any output format. Each emitter turns that same plan into its own
syntax, and the preview is a sixth: it draws the plan as JSX, so React escapes the caption
for free.

That is what makes six formats affordable. Every shape is a rounded rectangle with four
corner radii, so each format needs one curve routine rather than one per shape, and a new
module shape is an entry in `shapes.ts` that all six pick up at once.

Conventions — layout, styling, testing — are the portfolio's, in
[STANDARDS.md](https://github.com/jakeflavin/portfolio/blob/main/docs/STANDARDS.md).

## Storage

Everything is kept in `localStorage` under a `glyph.` prefix: the draft, the chosen kind,
the appearance settings, the theme, and the list of recent codes. Every app in the set
shares one origin, so the prefix is a requirement rather than a style.
