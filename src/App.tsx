import { useState, useEffect, useCallback } from 'react'
import { useRecorder } from './hooks/useRecorder'
import { useGroq } from './hooks/useGroq'
import { useClaude, type RefinementStyle } from './hooks/useClaude'
import { useHistory } from './hooks/useHistory'
import { RecordButton } from './components/RecordButton'
import { StyleTabs } from './components/StyleTabs'
import { TranscriptPanel } from './components/TranscriptPanel'
import { RefinedPanel } from './components/RefinedPanel'
import { HistorySidebar } from './components/HistorySidebar'

export default function App() {
  const [style, setStyle] = useState<RefinementStyle>('business')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const recorder = useRecorder()
  const groq = useGroq()
  const claude = useClaude()
  const { history, addItem, clearHistory } = useHistory()

  // When recording stops and audioBlob is ready, transcribe
  useEffect(() => {
    if (recorder.state === 'processing' && recorder.audioBlob) {
      groq.transcribe(recorder.audioBlob).then((text) => {
        recorder.resetProcessing()
        if (text) {
          claude.refine(text, style).then((refined) => {
            if (refined) {
              addItem({ transcript: text, refined, style })
            }
          })
        }
      })
    }
  }, [recorder.state, recorder.audioBlob]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStyleChange = useCallback(
    (newStyle: RefinementStyle) => {
      setStyle(newStyle)
      if (groq.transcript) {
        claude.refine(groq.transcript, newStyle)
      }
    },
    [groq.transcript, claude],
  )

  const handleRetry = useCallback(() => {
    if (groq.transcript) {
      claude.refine(groq.transcript, style)
    }
  }, [groq.transcript, style, claude])

  const handleHistorySelect = useCallback(
    (item: (typeof history)[0]) => {
      groq.setTranscript(item.transcript)
      claude.setRefined(item.refined)
      setStyle(item.style)
    },
    [groq, claude],
  )

  const groqError = groq.error
  const recorderError = recorder.error

  return (
    <div className="min-h-svh bg-[#0a0a0f] text-slate-200 flex flex-col">
      <HistorySidebar
        open={sidebarOpen}
        history={history}
        onSelect={handleHistorySelect}
        onClose={() => setSidebarOpen(false)}
        onClear={clearHistory}
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

        <div className="w-9" />
      </header>

      {/* Main scrollable content */}
      <main
        className="flex-1 flex flex-col gap-4 px-4 py-4 overflow-y-auto max-w-2xl w-full mx-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 160px)' }}
      >
        <StyleTabs style={style} onChange={handleStyleChange} />

        {(recorderError || groqError) && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3">
            <p className="text-red-300 text-sm whitespace-pre-wrap">{recorderError ?? groqError}</p>
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

      {/* Fixed bottom record button */}
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
