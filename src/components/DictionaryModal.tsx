import { useState, useRef, useEffect } from 'react'
import type { DictionaryEntry } from '../hooks/useDictionary'

interface Props {
  open: boolean
  entries: DictionaryEntry[]
  onAdd: (from: string, to: string) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, from: string, to: string) => void
  onClose: () => void
}

function EntryRow({
  entry,
  onRemove,
  onUpdate,
}: {
  entry: DictionaryEntry
  onRemove: (id: string) => void
  onUpdate: (id: string, from: string, to: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [from, setFrom] = useState(entry.from)
  const [to, setTo] = useState(entry.to)

  const save = () => {
    if (from.trim() && to.trim()) {
      onUpdate(entry.id, from, to)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="flex items-center gap-2 py-2 border-b border-[#1e1e2e]">
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          placeholder="誤字"
          autoFocus
        />
        <span className="text-slate-500">→</span>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          placeholder="正しい語"
        />
        <button onClick={save} className="text-indigo-400 hover:text-indigo-300 text-sm px-2">保存</button>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-2 py-2.5 border-b border-[#1e1e2e] group">
      <span className="flex-1 text-sm text-slate-300 truncate">{entry.from}</span>
      <span className="text-slate-500">→</span>
      <span className="flex-1 text-sm text-indigo-300 truncate">{entry.to}</span>
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300 p-1"
        aria-label="編集"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828A2 2 0 019 15v-2z" />
        </svg>
      </button>
      <button
        onClick={() => onRemove(entry.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 p-1"
        aria-label="削除"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}

export function DictionaryModal({ open, entries, onAdd, onRemove, onUpdate, onClose }: Props) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const fromRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setFrom('')
      setTo('')
      setTimeout(() => fromRef.current?.focus(), 100)
    }
  }, [open])

  const handleAdd = () => {
    if (!from.trim() || !to.trim()) return
    onAdd(from, to)
    setFrom('')
    setTo('')
    fromRef.current?.focus()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#13131a] border border-[#1e1e2e] rounded-2xl flex flex-col max-h-[80svh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="font-semibold text-slate-100">辞書</h2>
            <p className="text-xs text-slate-500 mt-0.5">誤字を自動で置き換えます</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add form */}
        <div className="px-5 py-3 border-b border-[#1e1e2e] flex items-center gap-2">
          <input
            ref={fromRef}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="誤字・誤変換"
            className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-slate-500 shrink-0">→</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="正しい語"
            className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleAdd}
            disabled={!from.trim() || !to.trim()}
            className="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
            aria-label="追加"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5">
          {entries.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">
              登録された単語がありません
            </p>
          ) : (
            <ul>
              {entries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onRemove={onRemove}
                  onUpdate={onUpdate}
                />
              ))}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e1e2e]">
            <p className="text-xs text-slate-600 text-center">{entries.length}件登録済み</p>
          </div>
        )}
      </div>
    </div>
  )
}
