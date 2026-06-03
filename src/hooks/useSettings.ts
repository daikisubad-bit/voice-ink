import { useState, useCallback } from 'react'

export interface Settings {
  autoCopy: boolean
  tapMode: boolean  // true=タップで開始/停止, false=長押し
}

const KEY = 'voiceink-settings'
const DEFAULTS: Settings = { autoCopy: true, tapMode: false }

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load)

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { settings, updateSetting }
}
