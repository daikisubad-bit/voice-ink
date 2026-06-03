import { useState } from 'react'
import type { BuiltinStyle } from '../hooks/useClaude'
import type { CustomStyle } from '../hooks/useCustomStyles'
import { CustomStyleModal } from './CustomStyleModal'

interface Props {
  selectedId: string
  customStyles: CustomStyle[]
  onChange: (id: string) => void
  onAddStyle: (style: Omit<CustomStyle, 'id'>) => void
  onUpdateStyle: (id: string, style: Omit<CustomStyle, 'id'>) => void
  onRemoveStyle: (id: string) => void
}

const BUILTIN_TABS: { id: BuiltinStyle; label: string }[] = [
  { id: 'casual', label: '💬 カジュアル' },
  { id: 'business', label: '📝 ビジネス' },
  { id: 'bullet', label: '📋 箇条書き' },
  { id: 'summary', label: '📊 要約' },
]

export function StyleTabs({ selectedId, customStyles, onChange, onAddStyle, onUpdateStyle, onRemoveStyle }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStyle, setEditingStyle] = useState<CustomStyle | null>(null)

  const handleEdit = (e: React.MouseEvent, style: CustomStyle) => {
    e.stopPropagation()
    setEditingStyle(style)
    setModalOpen(true)
  }

  const handleSave = (data: Omit<CustomStyle, 'id'>) => {
    if (editingStyle) {
      onUpdateStyle(editingStyle.id, data)
    } else {
      onAddStyle(data)
    }
    setModalOpen(false)
    setEditingStyle(null)
  }

  const handleDelete = (id: string) => {
    onRemoveStyle(id)
    if (selectedId === id) onChange('business')
    setModalOpen(false)
    setEditingStyle(null)
  }

  return (
    <>
      <div className="flex flex-wrap gap-1 bg-[#13131a] rounded-xl p-1 border border-[#1e1e2e]">
        {BUILTIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap',
              selectedId === tab.id
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}

        {customStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onChange(style.id)}
            className={[
              'group relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap',
              selectedId === style.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            {style.emoji} {style.label}
            <span
              onClick={(e) => handleEdit(e, style)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-slate-600 hover:bg-indigo-500 rounded-full text-white text-[9px] items-center justify-center hidden group-hover:flex transition-colors"
              role="button"
              aria-label="編集"
            >
              ✎
            </span>
          </button>
        ))}

        {/* 追加ボタン */}
        <button
          onClick={() => { setEditingStyle(null); setModalOpen(true) }}
          className="px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
          aria-label="スタイルを追加"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>追加</span>
        </button>
      </div>

      <CustomStyleModal
        open={modalOpen}
        editingStyle={editingStyle}
        onSave={handleSave}
        onDelete={editingStyle ? () => handleDelete(editingStyle.id) : undefined}
        onClose={() => { setModalOpen(false); setEditingStyle(null) }}
      />
    </>
  )
}
