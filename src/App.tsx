import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { KindTabs } from './components/KindTabs'
import { ContentForm } from './components/ContentForm'
import { Card } from './components/Card'
import { DesignCard } from './components/DesignCard'
import { Preview } from './components/Preview'
import { BulkCard } from './components/BulkCard'
import { History } from './components/History'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Columns, Controls, Foot, Page } from './App.styled'
import { usePersistentState } from './hooks/usePersistentState'
import { useTheme } from './hooks/useTheme'
import { buildMatrix, type Ecc } from './lib/matrix'
import { planDrawing } from './lib/render'
import { toCanvas } from './lib/emit-raster'
import { scanCheck, scanCheckSupported, type ScanResult } from './lib/scanCheck'
import { DEFAULT_STYLE, readDraft, readStyle } from './lib/settings'
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
import type { Template } from './lib/templates'

export function App() {
  const { theme, setTheme } = useTheme()
  const [kind, setKind] = usePersistentState<KindId>('glyph.kind', 'link')
  const [draft, setDraft] = usePersistentState('glyph.draft', EMPTY_DRAFT, { read: readDraft })
  const [ecc, setEcc] = usePersistentState<Ecc>('glyph.ecc', 'M')
  const [style, setStyle] = usePersistentState('glyph.style', DEFAULT_STYLE, { read: readStyle })
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('glyph.history', [])
  const [templates, setTemplates] = usePersistentState<Template[]>('glyph.templates', [])
  const [clearing, setClearing] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [checked, setChecked] = useState<{ inputs: object; result: ScanResult } | null>(null)

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

  /*
   * Read the code back, and say whether it worked.
   *
   * The result belongs to the inputs that produced it, so "still checking" is derived by
   * comparing what was checked against what is on screen rather than by a second piece of
   * state — which would have to be set from inside the effect, one render too late.
   */
  const inputs = useMemo(() => ({ matrix, style, payload }), [matrix, style, payload])
  const supported = useMemo(() => scanCheckSupported(), [])
  const checking = supported && matrix !== null && checked?.inputs !== inputs

  useEffect(() => {
    if (!inputs.matrix || !supported) return
    let live = true

    // Drawing and decoding costs a few milliseconds and every keystroke changes the code,
    // so it waits for a pause; a run overtaken by the next one throws its answer away.
    const timer = setTimeout(() => {
      const drawing = planDrawing(inputs.matrix as NonNullable<typeof inputs.matrix>, inputs.style)
      void scanCheck((pixels) => toCanvas(drawing, pixels), inputs.payload)
        .then((result) => {
          if (live) setChecked({ inputs, result })
        })
        .catch(() => {
          /* A reader that throws is a reader that is not there. */
        })
    }, 400)

    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [inputs, supported])

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
          check={supported ? (checked?.result ?? null) : 'unsupported'}
          checking={checking}
          onUse={onUse}
        />

        <Controls>
          <Card title="What the code says" note={current.hint}>
            <KindTabs kind={kind} onSelect={setKind} />
            <div id="code-form" role="tabpanel" aria-labelledby={`tab-${kind}`}>
              <ContentForm kind={kind} values={fieldsOf(draft, kind)} onChange={onField} />
            </div>
          </Card>

          <DesignCard
            style={style}
            ecc={ecc}
            templates={templates}
            onStyle={setStyle}
            onEcc={setEcc}
            onTemplates={setTemplates}
          />

          <BulkCard style={style} ecc={ecc} />

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
