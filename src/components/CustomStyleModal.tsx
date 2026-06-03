import { useState, useEffect } from 'react'
import type { CustomStyle } from '../hooks/useCustomStyles'
import { COMMON_RULES_TEXT } from '../hooks/useCustomStyles'

interface Props {
  open: boolean
  editingStyle: CustomStyle | null
  onSave: (style: Omit<CustomStyle, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}

const EMOJI_OPTIONS = ['✨', '🎯', '📣', '🔥', '💡', '📧', '🗒️', '🧠', '🎙️', '⚡']

const DEFAULT_PROMPT = `${COMMON_RULES_TEXT}

【カスタムスタイル名】
ここに整形の指示を書いてください。例：
- 敬語を使わずフレンドリーな文体にする
- SNS投稿向けに短くまとめる
- 技術的な内容をわかりやすく言い換える`

export function CustomStyleModal({ open, editingStyle, onSave, onDelete, onClose }: Props) {
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('✨')
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)

  useEffect(() => {
    if (open) {
      if (editingStyle) {
        setLabel(editingStyle.label)
        setEmoji(editingStyle.emoji)
        setPrompt(editingStyle.systemPrompt)
      } else {
        setLabel('')
        setEmoji('✨')
        setPrompt(DEFAULT_PROMPT)
      }
    }
  }, [open, editingStyle])

  const handleSave = () => {
    if (!label.trim() || !prompt.trim()) return
    onSave({ label: label.trim(), emoji, systemPrompt: prompt.trim() })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#13131a] border border-[#1e1e2e] rounded-2xl flex flex-col max-h-[90svh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e]">
          <h2 className="font-semibold text-slate-100">
            {editingStyle ? 'スタイルを編集' : '新しいスタイルを追加'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Emoji + Label */}
          <div className="flex gap-3">
            <div className="shrink-0">
              <p className="text-xs text-slate-500 mb-1.5">アイコン</p>
              <div className="flex flex-wrap gap-1 w-28">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={[
                      'w-8 h-8 rounded-lg text-base transition-all',
                      emoji === e ? 'bg-indigo-500' : 'hover:bg-[#1e1e2e]',
                    ].join(' ')}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1.5 block">スタイル名</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="例：SNS投稿"
                autoFocus
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">
              システムプロンプト
              <span className="ml-2 text-slate-600">（Claudeへの指示）</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-[#1e1e2e]">
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-sm text-red-400 hover:text-red-300 transition-colors mr-auto"
            >
              削除
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim() || !prompt.trim()}
            className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors font-medium"
          >
            {editingStyle ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  )
}
