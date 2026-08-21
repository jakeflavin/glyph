# Glyph

A QR code maker that runs entirely in the browser.

Live at <https://portfolio-4b9fe.web.app/glyph/>, as part of
[the portfolio](https://github.com/jakeflavin/portfolio).

## What it is

Type a link, some text, a wifi network or a contact card, and get a QR code you can
download as SVG or PNG. There is no account, no upload and no server.

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

Error correction, module shape, quiet zone and inverted colours are all adjustable, and
none of them change what the code says.

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

That split is deliberate. The preview and the file are rendered from the same path string,
so what is on screen cannot drift from what is downloaded.

```
src/
  lib/payloads.ts   what each kind encodes, and the escaping each format needs
  lib/fields.ts     the form, as data: one table of fields per kind
  lib/matrix.ts     text -> modules
  lib/render.ts     modules -> SVG, and modules -> PNG
  components/       everything that renders
  hooks/            state that outlives a render
```

Conventions — layout, styling, testing — are the portfolio's, in
[STANDARDS.md](https://github.com/jakeflavin/portfolio/blob/main/docs/STANDARDS.md).

## Storage

Everything is kept in `localStorage` under a `glyph.` prefix: the draft, the chosen kind,
the appearance settings, the theme, and the list of recent codes. Every app in the set
shares one origin, so the prefix is a requirement rather than a style.
