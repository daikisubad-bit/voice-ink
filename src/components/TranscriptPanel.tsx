interface Props {
  text: string | null
  loading: boolean
}

export function TranscriptPanel({ text, loading }: Props) {
  if (!loading && !text) return null

  return (
    <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-3">
      <p className="text-xs text-slate-500 mb-1.5 font-medium">文字起こし（原文）</p>
      {loading ? (
        <div className="space-y-1.5">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
        </div>
      ) : (
        <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
      )}
    </div>
  )
}
