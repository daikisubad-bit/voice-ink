import type { Settings } from '../hooks/useSettings'

interface Props {
  open: boolean
  settings: Settings
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onClose: () => void
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#1e1e2e] last:border-0">
      <div>
        <p className="text-sm text-slate-200 font-medium">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={[
          'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4',
          checked ? 'bg-indigo-500' : 'bg-slate-700',
        ].join(' ')}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

export function SettingsModal({ open, settings, onChange, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#13131a] border border-[#1e1e2e] rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e]">
          <h2 className="font-semibold text-slate-100">設定</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5">
          <ToggleRow
            label="自動コピー"
            description="整形完了後、自動的にクリップボードへコピーする"
            checked={settings.autoCopy}
            onChange={(v) => onChange('autoCopy', v)}
          />
          <ToggleRow
            label="タップモード"
            description="1回タップで録音開始、もう1回で停止（長押し不要）"
            checked={settings.tapMode}
            onChange={(v) => onChange('tapMode', v)}
          />
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-slate-600 text-center">
            ショートカット: <span className="font-mono text-slate-500">Space</span> で録音開始/停止
          </p>
        </div>
      </div>
    </div>
  )
}
