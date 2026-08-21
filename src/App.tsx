import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { KindTabs } from './components/KindTabs'
import { ContentForm } from './components/ContentForm'
import { Card } from './components/Card'
import { ColourControls } from './components/ColourControls'
import { ShapeControls } from './components/ShapeControls'
import { LogoControls } from './components/LogoControls'
import { ScanControls } from './components/ScanControls'
import { Preview } from './components/Preview'
import { History } from './components/History'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Columns, Controls, Foot, Page } from './App.styled'
import { usePersistentState } from './hooks/usePersistentState'
import { useTheme } from './hooks/useTheme'
import { buildMatrix, type Ecc } from './lib/matrix'
import type { Style } from './lib/render'
import {
  EMPTY_DRAFT,
  KINDS,
  encode,
  fieldsOf,
  summarize,
  type Draft,
  type KindId,
} from './lib/payloads'
import { addEntry, removeEntry, type HistoryEntry } from './lib/history'

const DEFAULT_STYLE: Style = {
  shape: 'square',
  eyeShape: 'square',
  margin: 4,
  dark: '#000000',
  light: '#ffffff',
  eye: null,
  logo: null,
  caption: '',
}

/**
 * A draft written by an older build is missing whatever fields have been added since, and
 * every field is read as a controlled input's value — so the stored object is merged into
 * the empty one rather than trusted whole.
 */
function readDraft(raw: string | null): Draft {
  if (!raw) return EMPTY_DRAFT
  try {
    const stored = JSON.parse(raw) as Partial<Draft>
    const merged = { ...EMPTY_DRAFT }
    for (const kind of KINDS) {
      const saved = stored[kind.id]
      if (saved) Object.assign(merged[kind.id], saved)
    }
    return merged
  } catch {
    return EMPTY_DRAFT
  }
}

/**
 * The same merge for the appearance, plus one migration: the first build had a single
 * `invert` flag where there are now two colours, and a stored `true` means the pair was
 * the other way round.
 */
function readStyle(raw: string | null): Style {
  if (!raw) return DEFAULT_STYLE
  try {
    const stored = JSON.parse(raw) as Partial<Style> & { invert?: boolean }
    const merged: Style = { ...DEFAULT_STYLE, ...stored }
    if (stored.invert && !stored.dark) {
      merged.dark = DEFAULT_STYLE.light
      merged.light = DEFAULT_STYLE.dark
    }
    return merged
  } catch {
    return DEFAULT_STYLE
  }
}

export function App() {
  const { theme, setTheme } = useTheme()
  const [kind, setKind] = usePersistentState<KindId>('glyph.kind', 'link')
  const [draft, setDraft] = usePersistentState<Draft>('glyph.draft', EMPTY_DRAFT, {
    read: readDraft,
  })
  const [ecc, setEcc] = usePersistentState<Ecc>('glyph.ecc', 'M')
  const [style, setStyle] = usePersistentState<Style>('glyph.style', DEFAULT_STYLE, {
    read: readStyle,
  })
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('glyph.history', [])
  const [clearing, setClearing] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  // Nothing publishes the passing of a minute, so the only way to keep "3 minutes ago"
  // honest is to ask. A minute is the smallest unit the list shows.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const payload = encode(kind, draft)

  // Encoding runs the whole Reed-Solomon pass, and this component re-renders for reasons
  // that have nothing to do with the content — a cleared confirmation, a ticking clock.
  const { matrix, error } = useMemo(() => buildMatrix(payload, ecc), [payload, ecc])

  const label = summarize(kind, draft)

  const onField = useCallback(
    (name: string, value: string | boolean) => {
      setDraft((current) => {
        // `fieldsOf` is the read side of this; here the name goes back into its record.
        const section = { ...current[kind], [name]: value } as Draft[typeof kind]
        return { ...current, [kind]: section }
      })
    },
    [kind, setDraft],
  )

  const onUse = useCallback(() => {
    if (!payload) return
    setHistory((current) =>
      addEntry(current, {
        id: crypto.randomUUID(),
        kind,
        label: label || payload.slice(0, 60),
        draft,
        at: Date.now(),
      }),
    )
  }, [draft, kind, label, payload, setHistory])

  const onRestore = useCallback(
    (restoredKind: KindId, restoredDraft: Draft) => {
      setKind(restoredKind)
      setDraft(restoredDraft)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setDraft, setKind],
  )

  const current = KINDS.find((entry) => entry.id === kind) ?? KINDS[0]

  return (
    <Page>
      <Header theme={theme} onTheme={setTheme} />

      <Columns>
        <Preview
          matrix={matrix}
          style={style}
          ecc={ecc}
          payload={payload}
          label={label}
          kind={kind}
          error={error}
          onUse={onUse}
        />

        <Controls>
          <Card title="What the code says" note={current.hint}>
            <KindTabs kind={kind} onSelect={setKind} />
            <div id="code-form" role="tabpanel" aria-labelledby={`tab-${kind}`}>
              <ContentForm kind={kind} values={fieldsOf(draft, kind)} onChange={onField} />
            </div>
          </Card>

          <Card title="Colour">
            <ColourControls style={style} onStyle={setStyle} />
          </Card>

          <Card title="Shape">
            <ShapeControls style={style} onStyle={setStyle} />
          </Card>

          <Card title="Logo and caption">
            <LogoControls
              style={style}
              correctionIsHighest={ecc === 'H'}
              onStyle={setStyle}
              onCaption={(caption) => setStyle({ ...style, caption })}
            />
          </Card>

          <Card title="Scanning">
            <ScanControls ecc={ecc} style={style} onEcc={setEcc} onStyle={setStyle} />
          </Card>

          <History
            entries={history}
            now={now}
            onRestore={onRestore}
            onRemove={(id) => setHistory((entries) => removeEntry(entries, id))}
            onClear={() => setClearing(true)}
          />
        </Controls>
      </Columns>

      <Foot>
        <p>
          Every code here is static. The address is written into the pattern itself, so it works for
          as long as whatever it points at does. Nothing is uploaded, nothing is counted, and there
          is no account to lapse.
        </p>
      </Foot>

      <ConfirmDialog
        open={clearing}
        title="Clear recent codes?"
        body="The list of codes made on this device goes. The codes you already downloaded are not affected."
        confirmLabel="Clear the list"
        onConfirm={() => {
          setHistory([])
          setClearing(false)
        }}
        onCancel={() => setClearing(false)}
      />
    </Page>
  )
}
