import type { RefinementStyle } from '../hooks/useClaude'

interface Props {
  style: RefinementStyle
  onChange: (s: RefinementStyle) => void
}

const TABS: { value: RefinementStyle; label: string }[] = [
  { value: 'business', label: '📝 ビジネス' },
  { value: 'casual', label: '💬 カジュアル' },
  { value: 'bullet', label: '📋 箇条書き' },
]

export function StyleTabs({ style, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-[#13131a] rounded-xl p-1 border border-[#1e1e2e]">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={[
            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            style === tab.value
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
