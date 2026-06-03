import type { HistoryItem } from '../hooks/useHistory'
import type { RefinementStyle } from '../hooks/useClaude'

interface Props {
  open: boolean
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onClose: () => void
  onClear: () => void
}

const STYLE_LABEL: Record<RefinementStyle, string> = {
  business: '📝 ビジネス',
  casual: '💬 カジュアル',
  bullet: '📋 箇条書き',
}

export function HistorySidebar({ open, history, onSelect, onClose, onClear }: Props) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-10"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          'fixed top-0 left-0 h-full w-72 bg-[#13131a] border-r border-[#1e1e2e] z-20',
          'flex flex-col transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#1e1e2e]">
          <h2 className="font-semibold text-slate-200">履歴</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm p-4 text-center">まだ履歴がありません</p>
          ) : (
            <ul>
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => { onSelect(item); onClose() }}
                    className="w-full text-left p-4 border-b border-[#1e1e2e] hover:bg-[#1e1e2e] transition-colors"
                  >
                    <p className="text-xs text-indigo-400 mb-1">{STYLE_LABEL[item.style]}</p>
                    <p className="text-sm text-slate-300 line-clamp-2 leading-snug">{item.refined}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(item.createdAt).toLocaleString('ja-JP', {
                        month: 'numeric', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-[#1e1e2e]">
            <button
              onClick={onClear}
              className="w-full py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              履歴をすべて削除
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
