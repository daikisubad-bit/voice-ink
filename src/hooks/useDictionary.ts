import { useState, useCallback } from 'react'

export interface DictionaryEntry {
  id: string
  from: string
  to: string
}

const KEY = 'voiceink-dictionary'

function load(): DictionaryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(entries: DictionaryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries))
}

export function useDictionary() {
  const [entries, setEntries] = useState<DictionaryEntry[]>(load)

  const addEntry = useCallback((from: string, to: string) => {
    const entry: DictionaryEntry = { id: crypto.randomUUID(), from: from.trim(), to: to.trim() }
    setEntries((prev) => {
      const next = [...prev, entry]
      save(next)
      return next
    })
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id)
      save(next)
      return next
    })
  }, [])

  const updateEntry = useCallback((id: string, from: string, to: string) => {
    setEntries((prev) => {
      const next = prev.map((e) => e.id === id ? { ...e, from: from.trim(), to: to.trim() } : e)
      save(next)
      return next
    })
  }, [])

  const applyDictionary = useCallback(
    (text: string): string => {
      let result = text
      for (const entry of entries) {
        if (!entry.from) continue
        // 単語境界なしで全置換（日本語対応）
        result = result.split(entry.from).join(entry.to)
      }
      return result
    },
    [entries],
  )

  return { entries, addEntry, removeEntry, updateEntry, applyDictionary }
}
