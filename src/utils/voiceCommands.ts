// 音声コマンド → 記号変換テーブル
const SUBSTITUTIONS: [RegExp, string][] = [
  [/びっくりまーく|びっくりマーク/gi, '！'],
  [/はてな/gi, '？'],
  [/てんてんてん|さんてんリーダー|さんてんりーだー/gi, '…'],
  [/かいぎょう|改行/gi, '\n'],
  [/とうじょう|登場/gi, '、'],   // よく誤変換されるケース向け（オプション）
  [/なかぐろ|中黒/gi, '・'],
  [/てん/gi, '・'],
]

// 文末に句点がなければ「。」を付ける
const SENTENCE_ENDINGS = /[。！？…!?]$/

export function applyVoiceCommands(text: string): string {
  let result = text

  // 記号置換
  for (const [pattern, replacement] of SUBSTITUTIONS) {
    result = result.replace(pattern, replacement)
  }

  // 文末処理：行ごとに確認して句点を付加
  result = result
    .split('\n')
    .map((line) => {
      const trimmed = line.trimEnd()
      if (!trimmed) return trimmed
      if (SENTENCE_ENDINGS.test(trimmed)) return trimmed
      return trimmed + '。'
    })
    .join('\n')

  return result
}
