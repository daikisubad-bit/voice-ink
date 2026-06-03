const SUBSTITUTIONS: [RegExp, string][] = [
  [/びっくりまーく|びっくりマーク/gi, '！'],
  [/はてな/gi, '？'],
  [/てんてんてん|さんてんリーダー|さんてんりーだー/gi, '…'],
  [/かいぎょう|改行/gi, '\n'],
  [/なかぐろ|中黒/gi, '・'],
]

// 句点を付けない語尾パターン
const NO_PERIOD_ENDINGS = /[。！？…!?]$|笑$|（笑）$|（笑$|ｗ$|w$|ｗｗ$|くてんなし$/i

// 「くてんなし」コマンドを除去するパターン
const REMOVE_KUTTEN_NASHI = /くてんなし$/gi

// 。笑 → 笑 のように句点+笑を修正
const FIX_WARAU = /。(笑|（笑）|（笑)/g

export function applyVoiceCommands(text: string): string {
  let result = text

  // 記号置換
  for (const [pattern, replacement] of SUBSTITUTIONS) {
    result = result.replace(pattern, replacement)
  }

  // 。笑 → 笑 の修正
  result = result.replace(FIX_WARAU, '$1')

  // 文末処理：行ごとに確認
  result = result
    .split('\n')
    .map((line) => {
      const trimmed = line.trimEnd()
      if (!trimmed) return trimmed

      // 「くてんなし」が含まれていたら除去して句点なしで返す
      if (REMOVE_KUTTEN_NASHI.test(trimmed)) {
        return trimmed.replace(REMOVE_KUTTEN_NASHI, '').trimEnd()
      }

      // 句点が不要な語尾なら何もしない
      if (NO_PERIOD_ENDINGS.test(trimmed)) return trimmed

      return trimmed + '。'
    })
    .join('\n')

  return result
}
