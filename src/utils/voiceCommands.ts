const SUBSTITUTIONS: [RegExp, string][] = [
  [/びっくりまーく|びっくりマーク/gi, '！'],
  [/はてな/gi, '？'],
  [/てんてんてん|さんてんリーダー|さんてんりーだー/gi, '…'],
  [/かいぎょう|改行/gi, '\n'],
  [/なかぐろ|中黒/gi, '・'],
]

// 句点を付けない語尾パターン（記号終わり・感嘆・笑い）
const NO_PERIOD_ENDINGS = /[。！？…!?]$|笑$|（笑）$|（笑$|ｗ$|w$|ｗｗ$/i

// 文の途中であることを示す接続助詞・助詞の語尾（自動判定）
const MID_SENTENCE_ENDINGS = /けど$|けれど$|けれども$|ながら$|つつ$|たり$|のに$|ので$|だから$|だし$|だって$|とか$|から$/

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

      // 句点が不要な語尾なら何もしない
      if (NO_PERIOD_ENDINGS.test(trimmed)) return trimmed

      // 接続助詞で終わる＝文の途中と判断して句点なし
      if (MID_SENTENCE_ENDINGS.test(trimmed)) return trimmed

      return trimmed + '。'
    })
    .join('\n')

  return result
}
