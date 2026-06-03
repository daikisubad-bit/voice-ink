import { useState, useCallback } from 'react'
import type { RefinementStyle } from './useClaude'

export interface HistoryItem {
  id: string
  transcript: string
  refined: string
  style: RefinementStyle
  createdAt: number
}

const KEY = 'voiceink-history'
const MAX = 10

function load(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(items: HistoryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(load)

  const addItem = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }
    setHistory((prev) => {
      const next = [newItem, ...prev].slice(0, MAX)
      save(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(KEY)
    setHistory([])
  }, [])

  return { history, addItem, clearHistory }
}
