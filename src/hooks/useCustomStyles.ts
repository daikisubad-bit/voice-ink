import { useState, useCallback } from 'react'

export interface CustomStyle {
  id: string
  label: string
  emoji: string
  systemPrompt: string
}

const KEY = 'voiceink-custom-styles'

const COMMON_RULES = `【共通ルール】
- フィラー語（えーと、あの、まあ、なんか など）を削除
- 同じ内容の繰り返しを削除
- 話しながら自己修正した部分は最終意図のみ残す
- 元の意味・情報は変えない
- 整形後のテキストのみ返す（説明文・前置きは不要）`

export const COMMON_RULES_TEXT = COMMON_RULES

function load(): CustomStyle[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(styles: CustomStyle[]) {
  localStorage.setItem(KEY, JSON.stringify(styles))
}

export function useCustomStyles() {
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>(load)

  const addStyle = useCallback((style: Omit<CustomStyle, 'id'>) => {
    const newStyle: CustomStyle = { ...style, id: crypto.randomUUID() }
    setCustomStyles((prev) => {
      const next = [...prev, newStyle]
      save(next)
      return next
    })
  }, [])

  const updateStyle = useCallback((id: string, updates: Omit<CustomStyle, 'id'>) => {
    setCustomStyles((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      save(next)
      return next
    })
  }, [])

  const removeStyle = useCallback((id: string) => {
    setCustomStyles((prev) => {
      const next = prev.filter((s) => s.id !== id)
      save(next)
      return next
    })
  }, [])

  return { customStyles, addStyle, updateStyle, removeStyle }
}
