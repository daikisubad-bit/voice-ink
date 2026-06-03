import { useCallback } from 'react'
import type { RecorderState } from '../hooks/useRecorder'

interface Props {
  state: RecorderState
  volume: number
  duration: number
  tapMode: boolean
  onStart: () => void
  onStop: () => void
}

export function RecordButton({ state, volume, duration, tapMode, onStart, onStop }: Props) {
  const isRecording = state === 'recording'
  const isProcessing = state === 'processing'

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const bars = Array.from({ length: 5 }, (_, i) => {
    const phase = (i / 4) * Math.PI
    return isRecording ? 8 + volume * 40 * Math.abs(Math.sin(phase)) : 4
  })

  // タップモード: クリックで開始/停止トグル
  const handleTap = useCallback(() => {
    if (isProcessing) return
    if (isRecording) onStop()
    else onStart()
  }, [isProcessing, isRecording, onStart, onStop])

  // 長押しモード
  const handlePressStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      if (!tapMode && state === 'idle') onStart()
    },
    [tapMode, state, onStart],
  )

  const handlePressEnd = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      if (!tapMode && state === 'recording') onStop()
    },
    [tapMode, state, onStop],
  )

  return (
    <div className="flex flex-col items-center gap-4">
      {isRecording && (
        <div className="flex items-end gap-1 h-12">
          {bars.map((h, i) => (
            <div
              key={i}
              style={{ height: `${Math.max(4, h)}px`, transition: 'height 0.1s ease' }}
              className="w-1.5 rounded-full bg-red-400"
            />
          ))}
        </div>
      )}

      <div className="relative">
        <button
          onClick={tapMode ? handleTap : undefined}
          onPointerDown={tapMode ? undefined : handlePressStart}
          onPointerUp={tapMode ? undefined : handlePressEnd}
          onPointerLeave={tapMode ? undefined : handlePressEnd}
          disabled={isProcessing}
          className={[
            'relative w-20 h-20 rounded-full flex items-center justify-center',
            'text-white font-medium select-none touch-none',
            'transition-transform duration-150 active:scale-95',
            isRecording
              ? 'bg-red-500 record-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]'
              : isProcessing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]',
          ].join(' ')}
          aria-label={isRecording ? '録音停止' : '録音開始'}
        >
          {isProcessing ? (
            <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : isRecording ? (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v6a2 2 0 004 0V5a2 2 0 00-2-2zm-7 8h2a5 5 0 0010 0h2a7 7 0 01-6 6.93V20h3v2H8v-2h3v-2.07A7 7 0 015 11z" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-sm text-slate-400 h-5">
        {isRecording ? (
          <span className="text-red-400 font-mono">{formatDuration(duration)}</span>
        ) : isProcessing ? (
          '処理中...'
        ) : tapMode ? (
          'タップして録音'
        ) : (
          'ボタンを押して録音'
        )}
      </p>
    </div>
  )
}
