import { useState, useCallback } from 'react'

interface Props {
  text: string | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function RefinedPanel({ text, loading, error, onRetry }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [text])

  if (!loading && !text && !error) return null

  return (
    <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 flex flex-col gap-4">
      <p className="text-xs text-slate-500 font-medium">AI整形結果</p>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-5 w-11/12" />
          <div className="skeleton h-5 w-4/5" />
          <div className="skeleton h-5 w-9/12" />
        </div>
      ) : error ? (
        <div className="space-y-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-sm transition-colors"
          >
            再試行
          </button>
        </div>
      ) : (
        <>
          <p className="text-lg leading-relaxed text-slate-100 whitespace-pre-wrap">{text}</p>
          <button
            onClick={handleCopy}
            className={[
              'w-full min-h-[48px] rounded-xl text-base font-medium transition-all duration-150',
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-500 hover:bg-indigo-400 active:scale-98 text-white shadow-[0_0_16px_rgba(99,102,241,0.3)]',
            ].join(' ')}
          >
            {copied ? 'コピーしました ✓' : 'コピー'}
          </button>
        </>
      )}
    </div>
  )
}
