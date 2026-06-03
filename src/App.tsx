import { useState, useEffect, useCallback, useRef } from 'react'
import { useRecorder } from './hooks/useRecorder'
import { useGroq } from './hooks/useGroq'
import { useClaude, BUILTIN_PROMPTS } from './hooks/useClaude'
import { useHistory } from './hooks/useHistory'
import { useDictionary } from './hooks/useDictionary'
import { useCustomStyles } from './hooks/useCustomStyles'
import { useSettings } from './hooks/useSettings'
import { applyVoiceCommands } from './utils/voiceCommands'
import { RecordButton } from './components/RecordButton'
import { StyleTabs } from './components/StyleTabs'
import { TranscriptPanel } from './components/TranscriptPanel'
import { RefinedPanel } from './components/RefinedPanel'
import { HistorySidebar } from './components/HistorySidebar'
import { DictionaryModal } from './components/DictionaryModal'
import { SettingsModal } from './components/SettingsModal'
import { Toast } from './components/Toast'

export default function App() {
  const [selectedStyleId, setSelectedStyleId] = useState<string>('business')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dictOpen, setDictOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const [toastShow, setToastShow] = useState(false)

  const recorder = useRecorder()
  const groq = useGroq()
  const claude = useClaude()
  const { history, addItem, clearHistory } = useHistory()
  const { entries, addEntry, removeEntry, updateEntry, applyDictionary } = useDictionary()
  const { customStyles, addStyle, updateStyle, removeStyle } = useCustomStyles()
  const { settings, updateSetting } = useSettings()

  // settingsを最新値でrefに保持（クロージャ問題を避ける）
  const settingsRef = useRef(settings)
  useEffect(() => { settingsRef.current = settings }, [settings])

  const resolvePrompt = useCallback(
    (styleId: string): string => {
      if (styleId in BUILTIN_PROMPTS) return BUILTIN_PROMPTS[styleId as keyof typeof BUILTIN_PROMPTS]
      return customStyles.find((s) => s.id === styleId)?.systemPrompt ?? BUILTIN_PROMPTS.business
    },
    [customStyles],
  )

  const autoCopyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setToastShow(false)
    requestAnimationFrame(() => {
      setToastKey((k) => k + 1)
      setToastShow(true)
    })
  }, [])

  // 録音停止 → 文字起こし → 音声コマンド＋辞書 → AI整形 → 自動コピー
  useEffect(() => {
    if (recorder.state === 'processing' && recorder.audioBlob) {
      groq.transcribe(recorder.audioBlob).then((text) => {
        recorder.resetProcessing()
        if (text) {
          const processed = applyDictionary(applyVoiceCommands(text))
          const prompt = resolvePrompt(selectedStyleId)
          claude.refine(processed, prompt).then((refined) => {
            if (refined) {
              addItem({ transcript: processed, refined, style: selectedStyleId as 'business' })
              if (settingsRef.current.autoCopy) autoCopyText(refined)
            }
          })
        }
      })
    }
  }, [recorder.state, recorder.audioBlob]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStyleChange = useCallback(
    (newId: string) => {
      setSelectedStyleId(newId)
      if (groq.transcript) claude.refine(groq.transcript, resolvePrompt(newId))
    },
    [groq.transcript, claude, resolvePrompt],
  )

  const handleRetry = useCallback(() => {
    if (groq.transcript) claude.refine(groq.transcript, resolvePrompt(selectedStyleId))
  }, [groq.transcript, selectedStyleId, claude, resolvePrompt])

  const handleHistorySelect = useCallback(
    (item: (typeof history)[0]) => {
      groq.setTranscript(item.transcript)
      claude.setRefined(item.refined)
      setSelectedStyleId(item.style)
    },
    [groq, claude],
  )

  // Spaceキーショートカット（input/textarea以外）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
      e.preventDefault()
      if (recorder.state === 'idle') recorder.startRecording()
      else if (recorder.state === 'recording') recorder.stopRecording()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [recorder])

  return (
    <div className="min-h-svh bg-[#0a0a0f] text-slate-200 flex flex-col">
      <HistorySidebar
        open={sidebarOpen}
        history={history}
        onSelect={handleHistorySelect}
        onClose={() => setSidebarOpen(false)}
        onClear={clearHistory}
      />
      <DictionaryModal
        open={dictOpen}
        entries={entries}
        onAdd={addEntry}
        onRemove={removeEntry}
        onUpdate={updateEntry}
        onClose={() => setDictOpen(false)}
      />
      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onChange={updateSetting}
        onClose={() => setSettingsOpen(false)}
      />
      <Toast key={toastKey} message="クリップボードにコピーしました ✓" show={toastShow} />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="履歴を開く"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="font-semibold tracking-wide text-slate-100">VoiceInk</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setDictOpen(true)}
            className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="辞書"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {entries.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="設定"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main */}
      <main
        className="flex-1 flex flex-col gap-4 px-4 py-4 overflow-y-auto max-w-2xl w-full mx-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 160px)' }}
      >
        <StyleTabs
          selectedId={selectedStyleId}
          customStyles={customStyles}
          onChange={handleStyleChange}
          onAddStyle={addStyle}
          onUpdateStyle={updateStyle}
          onRemoveStyle={removeStyle}
        />

        {(recorder.error || groq.error) && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3">
            <p className="text-red-300 text-sm whitespace-pre-wrap">{recorder.error ?? groq.error}</p>
          </div>
        )}

        <TranscriptPanel text={groq.transcript} loading={groq.loading} />
        <RefinedPanel
          text={claude.refined}
          loading={claude.loading}
          error={claude.error}
          onRetry={handleRetry}
        />
      </main>

      {/* 録音ボタン */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center pt-4 bg-gradient-to-t from-[#0a0a0f] to-transparent"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <RecordButton
          state={recorder.state}
          volume={recorder.volume}
          duration={recorder.duration}
          tapMode={settings.tapMode}
          onStart={recorder.startRecording}
          onStop={recorder.stopRecording}
        />
      </div>
    </div>
  )
}
