import { useState, useCallback } from 'react'

export function useGroq() {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const transcribe = useCallback(async (blob: Blob): Promise<string | null> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) {
      setError('VITE_GROQ_API_KEY が設定されていません。')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const form = new FormData()
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
      form.append('file', blob, `recording.${ext}`)
      form.append('model', 'whisper-large-v3')
      form.append('language', 'ja')
      form.append('response_format', 'json')

      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`Groq API エラー: ${res.status} ${msg}`)
      }

      const data = await res.json()
      const text: string = data.text?.trim() ?? ''

      if (!text) {
        setError('音声が検出されませんでした。もう一度お試しください。')
        return null
      }

      setTranscript(text)
      return text
    } catch (err) {
      setError(err instanceof Error ? err.message : '文字起こしに失敗しました。')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { transcript, loading, error, transcribe, setTranscript }
}
