import { useState, useEffect, useCallback } from 'react'
import { useRecorder } from './hooks/useRecorder'
import { useGroq } from './hooks/useGroq'
import { useClaude, BUILTIN_PROMPTS } from './hooks/useClaude'
import { useHistory } from './hooks/useHistory'
import { useDictionary } from './hooks/useDictionary'
import { useCustomStyles } from './hooks/useCustomStyles'
import { applyVoiceCommands } from './utils/voiceCommands'
import { RecordButton } from './components/RecordButton'
import { StyleTabs } from './components/StyleTabs'
import { TranscriptPanel } from './components/TranscriptPanel'
import { RefinedPanel } from './components/RefinedPanel'
import { HistorySidebar } from './components/HistorySidebar'
import { DictionaryModal } from './components/DictionaryModal'

export default function App() {
  const [selectedStyleId, setSelectedStyleId] = useState<string>('business')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dictOpen, setDictOpen] = useState(false)

  const recorder = useRecorder()
  const groq = useGroq()
  const claude = useClaude()
  const { history, addItem, clearHistory } = useHistory()
  const { entries, addEntry, removeEntry, updateEntry, applyDictionary } = useDictionary()
  const { customStyles, addStyle, updateStyle, removeStyle } = useCustomStyles()

  // 現在のスタイルのsystemPromptを解決
  const resolvePrompt = useCallback(
    (styleId: string): string => {
      if (styleId in BUILTIN_PROMPTS) {
        return BUILTIN_PROMPTS[styleId as keyof typeof BUILTIN_PROMPTS]
      }
      const custom = customStyles.find((s) => s.id === styleId)
      return custom?.systemPrompt ?? BUILTIN_PROMPTS.business
    },
    [customStyles],
  )

  // 録音停止 → 文字起こし → 音声コマンド→辞書適用 → AI整形
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
            }
          })
        }
      })
    }
  }, [recorder.state, recorder.audioBlob]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStyleChange = useCallback(
    (newId: string) => {
      setSelectedStyleId(newId)
      if (groq.transcript) {
        claude.refine(groq.transcript, resolvePrompt(newId))
      }
    },
    [groq.transcript, claude, resolvePrompt],
  )

  const handleRetry = useCallback(() => {
    if (groq.transcript) {
      claude.refine(groq.transcript, resolvePrompt(selectedStyleId))
    }
  }, [groq.transcript, selectedStyleId, claude, resolvePrompt])

  const handleHistorySelect = useCallback(
    (item: (typeof history)[0]) => {
      groq.setTranscript(item.transcript)
      claude.setRefined(item.refined)
      setSelectedStyleId(item.style)
    },
    [groq, claude],
  )

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

        <button
          onClick={() => setDictOpen(true)}
          className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="辞書を開く"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {entries.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
          )}
        </button>
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
        className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 pt-4 bg-gradient-to-t from-[#0a0a0f] to-transparent"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <RecordButton
          state={recorder.state}
          volume={recorder.volume}
          duration={recorder.duration}
          onStart={recorder.startRecording}
          onStop={recorder.stopRecording}
        />
      </div>
    </div>
  )
}
